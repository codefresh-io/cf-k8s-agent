'use strict';

const JSONStream = require('json-stream');

class K8SResource {
    constructor(resType) {
        this.resType = resType;
    }

    startStream(force = false) {
        if (!force && this.stream) {
            return this;
        }
        this.stream = this.entity.getStream();
        this.stream.ownerResource = this;
        const jsonStream = new JSONStream();
        this.jsonStream = this.stream.pipe(jsonStream);
        return this;
    }

    getStream() {
        return this.stream;
    }

    getJsonStream() {
        return this.jsonStream;
    }

    restartStream() {
        return this.startStream(true);
    }
}

module.exports = K8SResource;
