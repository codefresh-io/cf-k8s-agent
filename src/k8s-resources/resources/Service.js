'use strict';

const K8SResource = require('../ResourceBase');

class ServiceResource extends K8SResource {
    constructor(client) {
        super('service', client, client.api.v1.watch.services);
    }
}

module.exports = ServiceResource;
