'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const logger = require('../logger');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');
const statistics = require('../statistics');

let metadataFilter;
let counter;

const eventsPackage = [];

class CodefreshAPI {

    constructor(kubernetes) {
        this.kubernetes = kubernetes;

        this.initEvents = this.initEvents.bind(this);
        this.sendEventsWithLogger = this.sendEventsWithLogger.bind(this);
        this.sendEvents = this.sendEvents.bind(this);
        this.sendStatistics = this.sendStatistics.bind(this);
        this.updateHandler = this.updateHandler.bind(this);

        this._sendPackage = this._sendPackage.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this._needUpdate = this._needUpdate.bind(this);
        this._getIdentifyOptions = this._getIdentifyOptions.bind(this);

        setInterval(this._sendPackage, 2000);
    }


    /**
     * Init cluster events in monitor. Should be used when agent starts.
     * Agent will send all resources when watching will start.
     * @param accounts - array of binded accounts
     * @returns {Promise<void>}
     */
    async initEvents(accounts = []) {
        const { qs, headers } = this._getIdentifyOptions();

        const uri = `${config.apiUrl}/init`;
        logger.debug(`Before init events. ${uri}`);
        const options = {
            headers,
            method: 'POST',
            uri,
            body: {
                accounts,
            },
            qs,
            json: true,
        };

        logger.debug(`Init events. Cluster: ${config.clusterId}.`);
        logger.debug(JSON.stringify(qs));
        return Promise.all([this.getMetadata(), rp(options)])
            .then(([metadata]) => {
                metadataFilter = new MetadataFilter(metadata);
                counter = 1;
                logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
            });
    }

    sendEventsWithLogger(...args) {
        return this.sendEvents(...args).catch(error => {
            logger.error(error);
        });
    }

    /**
     * Send cluster event to monitor
     * @param payload - data for sending
     * @returns {Promise<void>}
     */
    async sendEvents(payload) {

        logger.info('Trigger send events');

        let data = _.cloneDeep(payload);

        if (data.kind === 'Status') {
            logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        let filteredMetadata = metadataFilter ? metadataFilter.buildResponse(payload.object, payload.object.kind) : payload.object;

        // For release override configmap by release
        if (payload.object.kind.match(/^configmap$/i)) {
            const releaseMetadata = await this.buildReleaseMetadata(payload);
            filteredMetadata = releaseMetadata ? releaseMetadata : filteredMetadata;
        }

        // For service send full data
        if (payload.object.kind.match(/^service$/i)) {
            const serviceMetadata = await this.buildServiceMetadata(payload);
            filteredMetadata = serviceMetadata ? serviceMetadata : filteredMetadata;
        }

        // For pod get images
        if (payload.object.kind.match(/^pod$/i)) {
            const podMetadata = await this.buildPodMetadata(payload);
            filteredMetadata = podMetadata ? podMetadata : filteredMetadata;
        }

        // For deployment
        if (payload.object.kind.match(/^deployment$/i)) {
            const deploymentMetadata = await this.buildDeploymentMetadata(payload);
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
            this._sendPackage([data]);
        } else {
            eventsPackage.push(data);
        }
        statistics.apply(data);
        statistics.incEvents();
        if (eventsPackage.length === 10) {
            this._sendPackage();
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
        logger.info(`Skip build release ,  entity ${JSON.stringify(payload)}`);
        return null;
    }

    async buildServiceMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        const preparedService = await this.kubernetes.prepareService(payload.object);
        if (preparedService) {
            const filteredFields = preparedService;
            return {
                ...payload.object,
                service: {
                    ...filteredFields,
                },
            };
        }

        return null;
    }

    async buildDeploymentMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        const preparedDeployment = await this.kubernetes.prepareDeployment(payload.object);
        if (preparedDeployment) {
            const filteredFields = preparedDeployment;
            return {
                ...payload.object,
                deployment: {
                    ...filteredFields,
                },
            };
        }

        return null;
    }

    async buildPodMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }

        const preparedPod = await this.kubernetes.preparePod(payload.object, this.getImage.bind(this));
        if (preparedPod) {
            const filteredFields = preparedPod;
            return {
                ...payload.object,
                pod: {
                    ...filteredFields,
                },
            };
        }

        return null;
    }

    updateHandler(callback) {
        setInterval(async () => {
            const need = await this._needUpdate();
            if (need) callback();
        }, 10000);
    }

    async _needUpdate() {
        const { qs, headers } = this._getIdentifyOptions();

        const uri = `${config.apiUrl}/state`;
        logger.debug(`Checking init events. ${uri}`);
        const options = {
            headers,
            method: 'GET',
            uri,
            qs,
            json: true,
        };

        const result = await rp(options);
        return result.needUpdate;
    }

    _sendPackage(block = eventsPackage) {
        const { length } = block;
        if (!length) return;

        const { qs, headers } = this._getIdentifyOptions();
        logger.debug(qs);
        logger.debug(headers);

        const uri = `${config.apiUrl}`;
        const options = {
            method: 'POST',
            uri,
            body: [...block],
            headers,
            qs,
            json: true,
        };

        block.splice(0, length);

        logger.debug(`Sending package with ${length} element(s).`);
        rp(options)
            .then((r) => {
                logger.info(`sending result: ${JSON.stringify(r)}`);
                statistics.incPackages();
            })
            .catch((e) => {
                logger.info(`sending result error: ${e.message}`);
            });
    }

    async getMetadata() {
        const { headers } = this._getIdentifyOptions();
        const uri = `${config.apiUrl}/metadata`;
        const options = {
            method: 'GET',
            uri,
            json: true,
            headers,
        };

        logger.debug(`Get metadata from ${uri}.`);
        return rp(options);
    }

    async sendStatistics() {
        const { headers, qs } = this._getIdentifyOptions();

        const uri = `${config.apiUrl}/statistics`;
        const body = statistics.result;
        const options = {
            method: 'POST',
            uri,
            qs,
            body,
            json: true,
            headers,
        };

        logger.debug(`Sending statistics. ${JSON.stringify(body)}`);
        return rp(options)
            .then(statistics.reset)
            .catch((e) => {
                logger.error(`sending statistics error: ${e.message}`);
            });
    }

    async getImage(imageId) {
        const uri = `${config.apiUrl}/images`;
        const options = {
            method: 'POST',
            uri,
            json: true,
            headers: {
                'authorization': config.token,
            },
            body: {
                imageId
            }
        };

        logger.debug(`Get image from ${uri}.`);
        return rp(options);
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
}

module.exports = CodefreshAPI;
