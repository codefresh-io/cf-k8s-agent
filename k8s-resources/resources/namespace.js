'use strict';

const K8SResource = require('../ResourceBase');

class NamespaceResource extends K8SResource {
    constructor(client) {
        super(NamespaceResource.getResourceType());
        this.entity = client.api.v1.watch.namespaces;
        this.client = client;
    }

    static getResourceType() {
        return 'namespace';
    }
}

module.exports = NamespaceResource;
