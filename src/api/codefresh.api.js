'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const config = require('../config');
const MetadataFilter = require('../filters/MetadataFilter');

let metadataFilter;
let counter;

const eventsPackage = [];

const sendPackage = () => {
    const { length } = eventsPackage;
    if (!length) return;

    const uri = `${config.apiUrl}/${config.userId}/${config.clusterId}`;
    const options = {
        method: 'POST',
        uri,
        body: { ...eventsPackage },
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
};

/**
 * Send cluster event to monitor
 * @param obj - data for sending
 * @returns {Promise<void>}
 */
const sendEvents = (obj) => {
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
        sendPackage();
    }
};

/**
 * Init cluster events in monitor. Should be used when agent starts.
 * Agent will send all resources when watching will start.
 * @param accounts - array of binded accounts
 * @returns {Promise<void>}
 */
async function initEvents(accounts = []) {
    const uri = `${config.apiUrl}/init/${config.userId}/${config.clusterId}`;
    global.logger.debug(`Before init events. ${uri}`);
    const options = {
        method: 'POST',
        uri,
        body: {
            accounts,
        },
        json: true,
    };

    global.logger.debug(`Init events. Cluster: ${config.clusterId}.`);
    return Promise.all([getMetadata(), rp(options)])
        .then(([metadata]) => {
            metadataFilter = new MetadataFilter(metadata);
            counter = 1;
            global.logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
        });
}

async function getMetadata() {
    const uri = `${config.apiUrl}/metadata`;
    const options = {
        method: 'GET',
        uri,
        headers: {
            'authorization': config.token,
            'x-cluster-id': config.clusterId,
        },
        json: true,
    };

    global.logger.debug(`Get metadata from ${uri}.`);
    return rp(options);
}

setInterval(sendPackage, 2000);

module.exports = {
    sendEvents,
    initEvents,
};
