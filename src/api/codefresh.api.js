'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const logger = require('../logger');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');
const statistics = require('../statistics');
const { kubeManager, ConfigMapEntity } = require('../kubernetes');

let metadataFilter;
let counter;

const eventsPackage = [];

class CodefreshAPI {

    constructor() {
        this.initEvents = this.initEvents.bind(this);
        this.sendEvents = this.sendEvents.bind(this);
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

    /**
     * Send cluster event to monitor
     * @param obj - data for sending
     * @returns {Promise<void>}
     */
    async sendEvents(obj) {
        let data = _.cloneDeep(obj);

        if (data.kind === 'Status') {
            logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        let filteredMetadata;

        filteredMetadata = metadataFilter.buildResponse(obj.object, obj.object.kind);

        // For release override configmap by release
        if (obj.object.kind.match(/^configmap$/i)) {
            const configMap = new ConfigMapEntity(obj.object);
            const releaseController = kubeManager.getReleaseController('kube-system');
            let release;
            const releaseName = configMap.getLabels().NAME;
            if (releaseName) {
                release = await releaseController.describe(releaseName);
            }
            if (release && +release._version <= +configMap._data.metadata.labels.VERSION) {
                // Send updates only for latest version
                const latest = release.getFullData();
                filteredMetadata = metadataFilter.buildResponse(latest, 'release');
                data.object.kind = 'Release';
                filteredMetadata = {
                    ...data.object,
                    release: filteredMetadata,
                };
                const { name, version } = release.getFullData();
                filteredMetadata.release.chartFiles = await releaseController.getChartDescriptorForRevision(name, version);
                filteredMetadata.release.chartManifest = await releaseController.getChartManifestForRevision(name, version);
                filteredMetadata.release.chartValues = await releaseController.getChartValuesForRevision(name, version);
            } else {
                filteredMetadata = null;
            }
        }

        if (!filteredMetadata) {
            return;
        }

        if (metadataFilter) {
            data = {
                ...data,
                object: filteredMetadata,
            };
        }

        data.counter = counter++;

        logger.debug(`ADD event to package. Cluster: ${config.clusterId}. ${data.object.kind}. ${obj.object.metadata.name}. ${data.type}`);
        logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);

        // TODO: Send each release separately in reason of large size. Should rewrite this code
        if (data.object.kind === 'Release') {
            this._sendPackage([data]);
        } else {
            eventsPackage.push(data);
        }
        statistics.incEvents();
        if (eventsPackage.length === 10) {
            this._sendPackage();
        }
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
                // events.data = _.drop(events.data, length);
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
