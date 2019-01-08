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

    async subscribe() {
        const _this = this;
        this.streams = [];
        this.resources = await resourcesFactory(this.client);

        const obss = _.entries(this.resources).map(([key, resource]) => {
            const stream = resource.startStream().getStream();
            const jsonStream = resource.getJsonStream();
            console.log(new Date().toISOString(), `stream ${key} start`);

            jsonStream.on('close', () => {
                console.log(new Date().toISOString(), `stream ${key} closed`);
                // delete _this.resources[stream.ownerResource];
                const reStream = resource.restartStream().getJsonStream();
                _this.mergedStream.merge(Kefir.fromEvents(reStream, 'data'));
                console.log(new Date().toISOString(), `stream ${key} recreated`);
            });

            return Kefir.fromEvents(jsonStream, 'data');
        });

        this.mergedStream = Kefir.merge(obss);
        this.mergedStream.onValue(async (obj) => {
            rp({
                method: 'POST',
                uri: config.apiUrl,
                body: obj,
                headers: {
                    'authorization': config.token,
                    'x-cluster-id': process.env.CLUSTER_ID || 'cf-load@codefresh-load',
                },
                json: true,
            }).catch(console.error);
        });

    }
}

module.exports = Subscriber;
