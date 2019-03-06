'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');
const statistics = require('../statistics');

let metadataFilter;
let counter;

const eventsPackage = [];

class CodefreshAPI {

    constructor() {
        this.initEvents = this.initEvents.bind(this);
        this.sendEvents = this.sendEvents.bind(this);
        this.updateHandler = this.updateHandler.bind(this);

        this._sendPackage = this._sendPackage.bind(this);
        this._getMetadata = this._getMetadata.bind(this);
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
        global.logger.debug(`Before init events. ${uri}`);
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

        global.logger.debug(`Init events. Cluster: ${config.clusterId}.`);
        return Promise.all([this._getMetadata(), rp(options)])
            .then(([metadata]) => {
                metadataFilter = new MetadataFilter(metadata);
                counter = 1;
                global.logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
            });
    }

    /**
     * Send cluster event to monitor
     * @param obj - data for sending
     * @returns {Promise<void>}
     */
    sendEvents(obj) {
        let data = _.cloneDeep(obj);

        if (data.kind === 'Status') {
            global.logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        if (metadataFilter) {
            data = {
                ...data,
                object: metadataFilter.buildResponse(obj.object, obj.object.kind),
            };
        }

        data.counter = counter++;

        global.logger.debug(`ADD event to package. Cluster: ${config.clusterId}. ${data.object.kind}. ${obj.object.metadata.name}. ${data.type}`);
        global.logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);
        eventsPackage.push(data);
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
        global.logger.debug(`Before init events. ${uri}`);
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

    _sendPackage() {
        const { length } = eventsPackage;
        if (!length) return;

        const { qs, headers } = this._getIdentifyOptions();

        const uri = `${config.apiUrl}`;
        const options = {
            method: 'POST',
            uri,
            body: [...eventsPackage],
            headers,
            qs,
            json: true,
        };

        eventsPackage.splice(0, length);

        global.logger.debug(`Sending package with ${length} element(s).`);
        rp(options)
            .then((r) => {
                // events.data = _.drop(events.data, length);
                global.logger.info(`sending result: ${JSON.stringify(r)}`);
                statistics.incPackages();
            })
            .catch((e) => {
                global.logger.info(`sending result error: ${e.message}`);
            });
    }

    async _getMetadata() {
        const uri = `${config.apiUrl}/metadata`;
        const options = {
            method: 'GET',
            uri,
            json: true,
        };

        global.logger.debug(`Get metadata from ${uri}.`);
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

module.exports = new CodefreshAPI();
