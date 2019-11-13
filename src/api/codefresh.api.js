'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const newRelicMonitor = require('cf-monitor');
const logger = require('../logger');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');
const statistics = require('../statistics');

let metadataFilter;
let counter;

let eventsPackage = [];

class CodefreshAPI {

    constructor(kubernetes) {
        this.kubernetes = kubernetes;

        this.initEvents = this.initEvents.bind(this);
        this.sendEventsWithLogger = this.sendEventsWithLogger.bind(this);
        this.sendEvents = this.sendEvents.bind(this);
        this.sendStatistics = this.sendStatistics.bind(this);
        this.checkState = this.checkState.bind(this);

        this._sendPackage = this._sendPackage.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this._request = this._request.bind(this);
        this._getIdentifyOptions = this._getIdentifyOptions.bind(this);

        setInterval(this._sendPackage, 120 * 1000);
    }


    /**
     * Init cluster events in monitor. Should be used when agent starts.
     * Agent will send all resources when watching will start.
     * @param accounts - array of binded accounts
     * @returns {Promise<void>}
     */
    async initEvents(accounts = []) {
        const uri = '/init';
        logger.debug(`Before init events. ${uri}`);
        logger.debug(`Init events. Cluster: ${config.clusterId}. Account: ${config.accountId}`);

        return Promise.all([
            this.getMetadata(),
            this._request({ method: 'POST', uri, body: { accounts }}),
        ])
            .then(([metadata]) => {
                metadataFilter = new MetadataFilter(metadata);
                counter = 1;
                logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
            });
    }

    sendEventsWithLogger(...args) {
        return this.sendEvents(...args).catch((error) => {
            logger.error(error);
            newRelicMonitor.noticeError(error);
        });
    }

    /**
     * Send cluster event to monitor
     * @param payload - data for sending
     * @returns {Promise<void>}
     */
    async sendEvents(payload) {

        let data = _.cloneDeep(payload);

        if (data.kind === 'Status') {
            logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        let filteredMetadata = metadataFilter ? metadataFilter.buildResponse(payload.object, payload.object.kind) : payload.object;

        // For release override configmap by release
        if (payload.object.kind.match(/^configmap$/i) && !config.forceDisableHelmReleases) {
            const releaseMetadata = await this.buildReleaseMetadata(payload);
            filteredMetadata = releaseMetadata ? releaseMetadata : filteredMetadata;
        }

        // For service send full data
        if (payload.object.kind.match(/^service$/i)) {
            const serviceMetadata = await this.buildServiceMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = serviceMetadata ? serviceMetadata : filteredMetadata;
        }

        // For pod get images
        if (payload.object.kind.match(/^pod$/i)) {
            const podMetadata = await this.buildPodMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = podMetadata ? podMetadata : filteredMetadata;
        }

        // For deployment
        if (payload.object.kind.match(/^deployment$/i)) {
            const deploymentMetadata = await this.buildDeploymentMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = deploymentMetadata ? deploymentMetadata : filteredMetadata;
        }


        if (!filteredMetadata) {
            return;
        }

        // Filtered and enriched data
        data = {
            ...data,
            object: filteredMetadata,
        };

        data.counter = counter++;

        logger.debug(`ADD event to package. Cluster: ${config.clusterId}. ${data.object.kind}. ${payload.object.metadata.name}. ${data.type}`);
        logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);

        // TODO: Send each release separately in reason of large size. Should rewrite this code
        if (data.object.kind === 'Release') {
            delete data.object.data;
            logger.info(`Send HELM release - ${data.object.metadata.name} - Payload size: ${JSON.stringify(data).length} - payload ${JSON.stringify(data)}`);
            await this._sendPackage([data]);
        } else {
            eventsPackage.push(data);
        }
        statistics.apply(data);
        statistics.incEvents();
        if (eventsPackage.length === 10) {
            await this._sendPackage();
        }
        else {
            logger.info(`Skip packages sending - size ${eventsPackage.length}`);
        }
    }

    async buildReleaseMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
                kind: 'Release',
            };
        }

        const preparedRelease = await this.kubernetes.prepareRelease(payload.object);
        if (preparedRelease) {
            const filteredFields = metadataFilter ? metadataFilter.buildResponse(preparedRelease, 'release') : preparedRelease;
            return {
                ...payload.object,
                kind: 'Release',
                release: {
                    ...filteredFields,
                },
            };
        }
        logger.debug(`Skip build release ,  entity ${JSON.stringify(payload)}`);
        return null;
    }

    async buildServiceMetadata(payload, disableDetailed = false) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        if (disableDetailed) {
            return payload.object;
        }

        const preparedService = await this.kubernetes.prepareService(payload.object);
        if (preparedService) {
            return {
                ...payload.object,
                service: {
                    ...preparedService,
                },
            };
        }

        return null;
    }

    async buildDeploymentMetadata(payload, disableDetailed = false) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        if (disableDetailed) {
            return payload.object;
        }

        const preparedDeployment = await this.kubernetes.prepareDeployment(payload.object);
        if (preparedDeployment) {
            return {
                ...payload.object,
                deployment: {
                    ...preparedDeployment,
                },
            };
        }

        return null;
    }

    async buildPodMetadata(payload, disableDetailed = false) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        if (disableDetailed) {
            return payload.object;
        }

        const preparedPod = await this.kubernetes.preparePod(payload.object, this.getImage.bind(this));
        if (preparedPod) {
            return {
                ...payload.object,
                pod: {
                    ...preparedPod,
                },
            };
        }

        return null;
    }

    async checkState(callback) {
        const uri = '/state';
        logger.debug(`Checking init events. ${uri}`);
        try {
            const result = await this._request({ uri });

            if (result.needRestart) {
                logger.info(`Agent exits by monitor command`);
                process.exit();
            }

            if (result.needUpdate) {
                callback();
            }
        } catch(error) {
            newRelicMonitor.noticeError(error);
            logger.error(`Error while checking state: ${error.message}`);
        }
    }

    _sendPackage(block = eventsPackage) {
        const { length } = block;
        if (!length || length === 0) return;

        const body = [...block];
        block.splice(0, length);

        logger.info(`Sending package with ${length} element(s).`);
        this._request({ method: 'POST', uri: '', body })
            .then((r) => {
                logger.debug(`sending result: ${JSON.stringify(r)}`);
                statistics.incPackages();
            })
            .then(() => {
                logger.info(`clean events package in memory `);
                eventsPackage = [];
            });
    }

    async getMetadata() {
        const uri = '/metadata';
        logger.debug(`Get metadata from ${uri}.`);
        return this._request({ uri });
    }

    async sendStatistics() {
        const uri = '/statistics';
        const body = statistics.result;

        logger.debug(`Sending statistics. ${JSON.stringify(body)}`);
        return this._request({ method: 'POST', uri, body })
            .then(statistics.reset);
    }

    async getImage(imageId) {
        const uri = '/images';
        logger.debug(`Get image from ${uri}.`);
        return this._request({ method: 'POST', uri, body: { imageId } });
    }

    _getIdentifyOptions() {
        if (config.token) {
            return {
                headers: {
                    'authorization': config.token,
                },
                qs: {
                    clusterId: config.clusterId,
                },
            };
        }
        return {
            headers: {},
            qs: {
                accountId: config.accountId,
                clusterId: config.clusterId,
            },
        };
    }

    _request(options) {
        const identify = this._getIdentifyOptions();
        const headers = _.merge(identify.headers, options.headers);
        const qs = _.merge(identify.qs, options.qs);

        const uri = `${config.apiUrl}${options.uri}`;
        const opts = _.merge({ json: true }, options, { headers, qs, uri });
        return rp(opts)
            .catch((e) => {
                logger.error(`Request error: ${e.statusCode} - ${e.message}`);
                newRelicMonitor.noticeError(e);
                return Promise.reject(e);
            });
    }
}

module.exports = CodefreshAPI;
