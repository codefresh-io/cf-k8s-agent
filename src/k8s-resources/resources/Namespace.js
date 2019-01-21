'use strict';

const K8SResource = require('../ResourceBase');

class NamespaceResource extends K8SResource {
    constructor(client) {
        super('namespace', client, client.api.v1.watch.namespaces);
    }
}

module.exports = NamespaceResource;
