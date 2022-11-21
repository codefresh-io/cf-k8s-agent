const _ = require('lodash');
const K8SResource = require('./K8SResource');
const K8SResourceUsingClient = require('./K8SResourceUsingClient');
const NamespaceStub = require('../k8s-resources/NamespaceStub');
const config = require('../config');

/**
 * Factory for creating instances of all supported resources
 * @param client
 * @returns {Promise<{deployment: K8SResource, service: K8SResource, pod: K8SResource}>}
 */
async function createResources(client, metadata) {
    const ns = config.resourcesNamespace();
    const resources = {};
    Object.entries(metadata.resources).forEach(([resource, data]) => {
        if (_.get(client, 'newClient')) {
            resources[resource] = new K8SResourceUsingClient(resource, data.path, client, ns);
        } else {
            resources[resource] = new K8SResource(resource, data.path, client, ns);
        }
    });

    if (ns) {
        resources.namespace = new NamespaceStub(ns);
    }

    return resources;
}

module.exports = createResources;
