'use strict';

const JSONStream = require('json-stream');

class K8SResource {
    constructor(resType) {
        this.resType = resType;
    }

    _startStream() {
        this.stream = this.entity.getStream();
        this.stream.ownerResource = this;
        const jsonStream = new JSONStream();
        return this.stream.pipe(jsonStream);
    }

    getStream() {
        if (this.stream) {
            return this.stream;
        }
        return this._startStream();
    }

    restartStream() {
        return this._startStream();
    }
}

module.exports = K8SResource;
