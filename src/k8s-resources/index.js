'use strict';

const K8SResource = require('./K8SResource');

/**
 * Factory for creating instances of all supported resources
 * @param client
 * @returns {Promise<{deployment: K8SResource, service: K8SResource, pod: K8SResource}>}
 */
async function createResources(client) {
    return {
        // namespace: new K8SResource('namespace', client.api.v1.watch.namespaces),
        deployment: new K8SResource('deployment', client.apis.apps.v1.watch.deployments),
        service: new K8SResource('service', client.api.v1.watch.services),
        pod: new K8SResource('pod', client.api.v1.watch.pods),
    };
}

module.exports = createResources;
