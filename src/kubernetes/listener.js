'use strict';

const _ = require('lodash');
const Kefir = require('kefir');
const resourcesFactory = require('../k8s-resources');
const { sendEvents } = require('../api/codefresh.api');

class Listener {
    constructor(client) {
        this.client = client;
        this.mergedStream = null;
        this.resources = {};
    }

    _closeHandler(type, resource) {
        return () => {
            global.logger.info(`${new Date().toISOString()}: stream ${type} closed`);
            this._restartStream(type, resource);
        };
    }

    _errorHandler(type, resource) {
        return (err) => {
            global.logger.error(`Error in ${type} stream. ${err}`);
            setTimeout(() => {
                global.logger.info(`${new Date().toISOString()}: Trying to restart stream ${type}`);
                this._restartStream(type, resource);
            }, 2000);
        };
    }

    _restartStream(type, resource) {
        const { stream, jsonStream } = resource.restartStream();
        stream.on('close', this._closeHandler(type, resource));
        stream.on('error', this._errorHandler(type, resource));

        this.mergedStream = this.mergedStream.merge(Kefir.fromEvents(jsonStream, 'data'));
        this.mergedStream.onValue(sendEvents);
        global.logger.info(`${new Date().toISOString()}: Stream ${type} was recreated`);
    }

    async subscribe() {
        const _this = this;
        this.streams = [];
        this.resources = await resourcesFactory(this.client);

        const obss = _.entries(this.resources).map(([type, resource]) => {
            const { stream, jsonStream } = resource.startStream();
            stream.on('close', _this._closeHandler(type, resource));
            stream.on('error', _this._errorHandler(type, resource));

            global.logger.info(`${new Date().toISOString()}: Stream ${type} was started`);

            return Kefir.fromEvents(jsonStream, 'data');
        });

        this.mergedStream = Kefir.merge(obss);
        this.mergedStream.onValue(sendEvents);
    }
}

module.exports = Listener;
