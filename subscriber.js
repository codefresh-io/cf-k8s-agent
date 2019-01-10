'use strict';

const _ = require('lodash');
const Kefir = require('kefir');
const rp = require('request-promise');
const resourcesFactory = require('./k8s-resources');
const config = require('./config');

class Subscriber {
    constructor(client) {
        this.client = client;
        this.mergedStream = null;
        this.resources = {};
    }

    _closeHandler(type, resource) {
        return () => {
            console.log(new Date().toISOString(), `stream ${type} closed`);
            this._restartStream(type, resource);
        };
    };

    _errorHandler(type, resource) {
        return () => {
            console.error(`Error in ${type} stream`);
            setTimeout(() => {
                console.log('Trying to restart stream');
                this._restartStream(type, resource);
            }, 2000);
        };
    };

    _restartStream(type, resource) {
        const stream = resource.restartStream().getStream();
        stream.on('close', this._closeHandler(type, resource));
        stream.on('error', this._errorHandler(type, resource));

        const reStream = resource.getJsonStream();
        this.mergedStream = this.mergedStream.merge(Kefir.fromEvents(reStream, 'data'));
        this.mergedStream.onValue(this._processor);
        console.log(new Date().toISOString(), `stream ${type} recreated`);
    }

    async _processor(obj) {
        rp({
            method: 'POST',
            uri: config.apiUrl,
            body: obj,
            headers: {
                'authorization': config.token,
                'x-cluster-id': config.clusterId,
            },
            json: true,
        }).catch(console.error);
    }

    async subscribe() {
        const _this = this;
        this.streams = [];
        this.resources = await resourcesFactory(this.client);

        const obss = _.entries(this.resources).map(([key, resource]) => {
            const stream = resource.startStream().getStream();
            stream.on('close', _this._closeHandler(key, resource));
            stream.on('error', _this._errorHandler(key, resource));

            const jsonStream = resource.getJsonStream();
            console.log(new Date().toISOString(), `stream ${key} start`);

            return Kefir.fromEvents(jsonStream, 'data');
        });

        this.mergedStream = Kefir.merge(obss);
        this.mergedStream.onValue(this._processor);
    }
}

module.exports = Subscriber;
