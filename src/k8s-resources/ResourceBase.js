'use strict';

const JSONStream = require('json-stream');

class K8SResource {
    constructor(client, entity) {
        this.entity = entity;
        this.client = client;
    }

    startStream(force = false) {
        if (!force && this.stream) {
            //TODO : add logs
            return this;
        }
        this.stream = this.entity.getStream();
        //TODO : check is it using
        this.stream.ownerResource = this;
        return {
            stream: this.stream,
            jsonStream: this.stream.pipe(new JSONStream()),
        };
    }

    restartStream() {
        return this.startStream(true);
    }
}

module.exports = K8SResource;
