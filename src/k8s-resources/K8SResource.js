const _ = require('lodash');
const JSONStream = require('json-stream');
const logger = require('../logger');

/**
 * Class for implementing of cluster resources
 */
class K8SResource {
    constructor(type, path, client, namespace) {
        this.type = type;
        this.entity = _.get(client, path);
        this.path = path;
        this.client = client;
        this.namespace = namespace;
    }

    get() {
        if (this.namespace) {
            const resourcePath = this.path.replace('.watch', '.namespace(this.namespace)');
            const resource = `this.client.${resourcePath}.get()`;
            // eslint-disable-next-line no-eval
            return eval(resource);
        }

        const resource = _.get(this.client, this.path.replace('.watch', ''));
        return resource.get();
    }

    /**
     * Starts new stream for monitoring of resource.
     * @param force - true will cause starting of new stream even if stream of this type already exists
     * @returns { stream|jsonStream }
     */
    startStream(force = false) {
        if (!force && this.stream) {
            logger.info(`Return existing stream of type "${this.type}"`);
            return this;
        }

        logger.info(`Start new stream of type "${this.type}"`);
        this.stream = this.entity.getStream();

        return {
            stream: this.stream,
            jsonStream: this.stream.pipe(new JSONStream()),
        };
    }

    /**
     * Restarts stream
     * @returns {stream|jsonStream}
     */
    restartStream() {
        return this.startStream(true);
    }
}

module.exports = K8SResource;
