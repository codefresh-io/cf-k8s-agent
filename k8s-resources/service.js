'use strict';

const JSONStream = require('json-stream');
const K8SResource = require('./index').base;

class ServiceResource extends K8SResource {
    constructor() {
        super(ServiceResource.getResourceType());
    }

    static getResourceType() {
        return 'service';
    }

    getStream(client) {
        const stream = client.api.v1.watch.services.getStream();
        const jsonStream = new JSONStream();
        return stream.pipe(jsonStream);
    }
}

module.exports = ServiceResource;
