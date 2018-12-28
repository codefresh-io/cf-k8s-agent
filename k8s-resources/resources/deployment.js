'use strict';

const K8SResource = require('../ResourceBase');

class DeploymentResource extends K8SResource {
    constructor(client) {
        super(DeploymentResource.getResourceType());
        this.entity = client.apis.apps.v1.watch.deployments;
        this.client = client;
    }

    static getResourceType() {
        return 'deployment';
    }
}

module.exports = DeploymentResource;
