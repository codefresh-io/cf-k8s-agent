'use strict';

const K8SResource = require('../ResourceBase');

class DeploymentResource extends K8SResource {
    constructor(client) {
        super('deployment', client, client.apis.apps.v1.watch.deployments);
    }
}

module.exports = DeploymentResource;
