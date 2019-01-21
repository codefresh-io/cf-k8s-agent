'use strict';

const K8SResource = require('../ResourceBase');

class ServiceResource extends K8SResource {
    constructor(client) {
        super('pod', client, client.api.v1.watch.pods);
    }
}

module.exports = ServiceResource;
