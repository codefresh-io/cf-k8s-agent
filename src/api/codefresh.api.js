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
    // global.logger.debug(`Sending event. Cluster: ${config.clusterId}. ${data.object.kind}. ${data.object.metadata.name}. ${data.type}`);

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

    const uri = config.apiUrl.replace('{path}', '/events');
    const options = {
        method: 'POST',
        uri,
        body: data,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        json: true,
    };

    global.logger.debug(`Sending event. Cluster: ${config.clusterId}. ${data.object.kind}. ${data.object['metadata.name']}. ${data.type}`);
    global.logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);
    rp(options).catch(global.logger.error);
};

/**
 * Init cluster events in monitor. Should be used when agent starts.
 * Agent will send all resources when watching will start.
 * @param accounts - array of binded accounts
 * @returns {Promise<void>}
 */
async function initEvents(accounts = []) {
    const uri = config.apiUrl.replace('{path}', '/events/init');
    global.logger.debug(`Before init events. ${uri}`);
    const options = {
        method: 'POST',
        uri,
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
            global.logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
        });
}

async function getMetadata() {
    const uri = config.apiUrl.replace('{path}', '/events/metadata');
    const options = {
        method: 'GET',
        uri,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        json: true,
    };

    global.logger.debug(`Get metadata.`);
    return rp(options);
}

module.exports = {
    sendEvents,
    initEvents,
};
