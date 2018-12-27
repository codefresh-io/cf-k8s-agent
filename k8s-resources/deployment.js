'use strict';

const JSONStream = require('json-stream');
const K8SResource = require('./index').base;

class DeploymentResource extends K8SResource {
    constructor() {
        super(DeploymentResource.getResourceType());
    }

    static getResourceType() {
        return 'deployment';
    }

    getStream(client) {
        const stream = client.apis.apps.v1.watch.deployments.getStream();
        const jsonStream = new JSONStream();
        return stream.pipe(jsonStream);
    }
}

module.exports = DeploymentResource;
