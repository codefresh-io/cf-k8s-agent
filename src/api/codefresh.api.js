'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const config = require('../config');

/**
 * Send cluster event to monitor
 * @param obj - data for sending
 * @returns {Promise<void>}
 */
const sendEvents = async (obj) => {
    const options = {
        method: 'POST',
        uri: `${config.apiUrl}/events`,
        body: obj,
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
    };

    global.logger.debug(`Init events. Cluster: ${config.clusterId}.`);
    return rp(options);
}

module.exports = {
    sendEvents,
    initEvents,
};
