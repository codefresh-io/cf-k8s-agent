'use strict';

const K8SResource = require('../ResourceBase');

const RESOURCE_TYPE = 'namespace';

class NamespaceResource extends K8SResource {
    constructor(client) {
        super(RESOURCE_TYPE, client.api.v1.watch.namespaces);
        this.client = client;
    }
}

module.exports = NamespaceResource;
