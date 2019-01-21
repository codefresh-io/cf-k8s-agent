'use strict';

const K8SResource = require('../ResourceBase');

const RESOURCE_TYPE = 'service';

class ServiceResource extends K8SResource {
    constructor(client) {
        super(RESOURCE_TYPE, client.api.v1.watch.services);
        this.client = client;
    }
}

module.exports = ServiceResource;
