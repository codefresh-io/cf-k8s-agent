'use strict';

const K8SResource = require('./K8SResource');

async function createResources(client) {
    return {
        namespace: new K8SResource('namespace', client, client.api.v1.watch.namespaces),
        deployment: new K8SResource('deployment', client, client.apis.apps.v1.watch.deployments),
        service: new K8SResource('service', client, client.api.v1.watch.services),
        pod: new K8SResource('pod', client, client.api.v1.watch.pods),
    };
}

module.exports = createResources;
