'use strict';

const K8SResource = require('../ResourceBase');

class ServiceResource extends K8SResource {
    constructor(client) {
        super(ServiceResource.getResourceType());
        this.entity = client.api.v1.watch.pods;
        this.client = client;
    }

    static getResourceType() {
        return 'pod';
    }
}

module.exports = ServiceResource;
