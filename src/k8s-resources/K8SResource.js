'use strict';

const JSONStream = require('json-stream');

class K8SResource {
    constructor(type, entity) {
        this.type = type;
        this.entity = entity;
    }

    startStream(force = false) {
        if (!force && this.stream) {
            global.logger.info(`${new Date().toISOString()}: Return existing stream of type "${this.type}"`);
            return this;
        }

        global.logger.info(`${new Date().toISOString()}: Start new stream of type "${this.type}"`);
        this.stream = this.entity.getStream();

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
