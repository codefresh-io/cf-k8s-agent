'use strict';

const rp = require('request-promise');
const config = require('../config');

/**
 * Send cluster event to monitor
 * @param obj
 * @returns {Promise<void>}
 */
async function sendEvents(obj) {
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

    global.logger.debug(`Sending event. ${JSON.stringify(options)}`);
    rp(options).catch(global.logger.error);
}

async function clearEvents() {
    const options = {
        method: 'DELETE',
        uri: `${config.apiUrl}/events`,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
    };

    global.logger.debug(`Delete events. ${JSON.stringify(options)}`);
    return rp(options);
}

module.exports = {
    sendEvents,
    clearEvents,
};
