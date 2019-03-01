'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');

let metadataFilter;
let counter;

const eventsPackage = [];

class CodefreshAPI {

    constructor() {
        this.initEvents = this.initEvents.bind(this);
        this.sendEvents = this.sendEvents.bind(this);

        this._sendPackage = this._sendPackage.bind(this);
        this._getMetadata = this._getMetadata.bind(this);
        this._getIdentifyData = this._getIdentifyData.bind(this);
        this._buildRequestHeaders = this._buildRequestHeaders.bind(this);

        setInterval(this._sendPackage, 2000);
    }


    /**
     * Init cluster events in monitor. Should be used when agent starts.
     * Agent will send all resources when watching will start.
     * @param accounts - array of binded accounts
     * @returns {Promise<void>}
     */
    async initEvents(accounts = []) {
        const uri = `${config.apiUrl}/init`;
        global.logger.debug(`Before init events. ${uri}`);
        const options = {
            headers: {
                'x-cluster-id': config.clusterId,
                'x-account-id': config.accountId,
                'authorization': config.token,
            },
            method: 'POST',
            uri,
            body: {
                accounts,
            },
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
        if (eventsPackage.length === 10) {
            this._sendPackage();
        }
    }

    _sendPackage() {
        const { length } = eventsPackage;
        if (!length) return;

        const uri = `${config.apiUrl}`;
        const options = {
            method: 'POST',
            uri,
            body: [...eventsPackage],
            headers: {
                ...this._buildRequestHeaders(),
            },
            json: true,
        };

        eventsPackage.splice(0, length);

        global.logger.debug(`Sending package with ${length} element(s).`);
        rp(options)
            .then((r) => {
                // events.data = _.drop(events.data, length);
                global.logger.info(`sending result: ${JSON.stringify(r)}`);
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
            headers: {
                ...this._buildRequestHeaders(),
            },
            json: true,
        };

        global.logger.debug(`Get metadata from ${uri}.`);
        return rp(options);
    }

    _getIdentifyData() {
        if (config.token) {
            return {
                'authorization': config.token,
            };
        }
        return {
            'x-account-id': config.accountId,
        };
    }

    _buildRequestHeaders() {
        return {
            'x-cluster-id': config.clusterId,
            ...this._getIdentifyData(),
        };
    }

}

module.exports = new CodefreshAPI();
