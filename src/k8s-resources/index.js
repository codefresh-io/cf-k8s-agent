'use strict';

const _ = require('lodash');

const K8SResource = require('./K8SResource');

/**
 * Factory for creating instances of all supported resources
 * @param client
 * @returns {Promise<{deployment: K8SResource, service: K8SResource, pod: K8SResource}>}
 */
async function createResources(client, metadata) {
    const resources = {};
    Object.entries(metadata.resources).forEach(([resource, data]) => {
        resources[resource] = new K8SResource(resource, _.get(client, data.path));
    });
    return resources;
}

module.exports = createResources;
