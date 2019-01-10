'use strict';

const K8SResource = require('../ResourceBase');

class ServiceResource extends K8SResource {
    constructor(client) {
        super(ServiceResource.getResourceType());
        this.entity = client.api.v1.watch.services;
        this.client = client;

        // setTimeout(() => {
        //     this.stream.abort();
        //     console.log(`stream ${ServiceResource.getResourceType()} destroyed`);
        // }, 5000);
    }

    static getResourceType() {
        return 'service';
    }
}

module.exports = ServiceResource;
