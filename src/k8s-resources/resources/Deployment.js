'use strict';

const K8SResource = require('../ResourceBase');

const RESOURCE_TYPE = 'deployment';

class DeploymentResource extends K8SResource {
    constructor(client) {
        super(RESOURCE_TYPE, client.apis.apps.v1.watch.deployments);
        this.client = client;
    }
}

module.exports = DeploymentResource;
