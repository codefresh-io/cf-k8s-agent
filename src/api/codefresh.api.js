'use strict';

const rp = require('request-promise');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');

let metadataFilter;

/**
 * Send cluster event to monitor
 * @param obj - data for sending
 * @returns {Promise<void>}
 */
const sendEvents = async (obj) => {
    let data = obj;
    if (metadataFilter) {
        data = {
            ...data,
            object: metadataFilter.buildResponse(obj.object, obj.object.kind),
        };
    }

    const options = {
        method: 'POST',
        uri: `${config.apiUrl}/events`,
        body: data,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        json: true,
    };

    global.logger.debug(`Sending event. Cluster: ${config.clusterId}.`);
    rp(options).catch(global.logger.error);
};

/**
 * Init cluster events in monitor. Should be used when agent starts.
 * Agent will send all resources when watching will start.
 * @param accounts - array of binded accounts
 * @returns {Promise<void>}
 */
async function initEvents(accounts = []) {
    const options = {
        method: 'POST',
        uri: `${config.apiUrl}/events/init`,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        body: {
            accounts,
        },
        json: true,
    };

    global.logger.debug(`Init events. Cluster: ${config.clusterId}.`);
    return Promise.all([getMetadata(), rp(options)])
        .then(([metadata]) => {
            metadataFilter = new MetadataFilter(metadata);
        });
}

async function getMetadata() {
    const options = {
        method: 'GET',
        uri: `${config.apiUrl}/events/metadata`,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        json: true,
    };

    global.logger.debug(`Get metadata`);
    return rp(options);
}

module.exports = {
    sendEvents,
    initEvents,
};
