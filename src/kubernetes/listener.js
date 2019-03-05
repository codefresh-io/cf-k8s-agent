'use strict';

const _ = require('lodash');
const Kefir = require('kefir');
const resourcesFactory = require('../k8s-resources');
const { sendEvents } = require('../api/codefresh.api');
const config = require('../config');
const statistics = require('../statistics');

/**
 * Class for monitoring cluster resources
 */
class Listener {
    constructor(client) {
        this.client = client;
        this.mergedStream = null;
        this.resources = {};
    }

    /**
     * Creator of handler function for stream 'close' event
     * @param type
     * @param resource
     * @returns {Function}
     * @private
     */
    _closeHandler(type, resource) {
        return () => {
            global.logger.info(`Stream ${type} closed`);
            statistics.incStreamLoses(type);
            this._restartStream(type, resource);
        };
    }

    /**
     * Creator of handler function for stream 'error' event
     * @param type
     * @param resource
     * @returns {Function}
     * @private
     */
    _errorHandler(type, resource) {
        return (err) => {
            global.logger.error(`Error in ${type} stream. ${err}`);
            setTimeout(() => {
                global.logger.info(`Trying to restart stream ${type}`);
                this._restartStream(type, resource);
                statistics.addError(err, type, resource);
            }, config.retryInterval);
        };
    }

    /**
     * Restarts stream and sets event handlers. Appends new stream in merged kefir stream.
     * Used for restarting stream after closing or error
     * @param type
     * @param resource
     * @private
     */
    _restartStream(type, resource) {
        const { stream, jsonStream } = resource.restartStream();
        stream.on('close', this._closeHandler(type, resource));
        stream.on('error', this._errorHandler(type, resource));

        this.mergedStream = this.mergedStream.merge(Kefir.fromEvents(jsonStream, 'data'));
        this.mergedStream.onValue(sendEvents);
        global.logger.info(`Stream ${type} was recreated`);
    }

    /**
     * Gets all supported resources, creates streams for each of them,
     * merges them in one stream and handle events data from this stream
     * @returns {Promise<void>}
     */
    async subscribe() {
        const _this = this;
        this.resources = await resourcesFactory(this.client);

        const observables = _.entries(this.resources).map(([type, resource]) => {
            const { stream, jsonStream } = resource.startStream();
            stream.on('close', _this._closeHandler(type, resource));
            stream.on('error', _this._errorHandler(type, resource));

            global.logger.info(`Stream ${type} was started`);

            return Kefir.fromEvents(jsonStream, 'data');
        });

        this.mergedStream = Kefir.merge(observables);
        this.mergedStream.onValue(sendEvents);
    }
}

module.exports = Listener;
