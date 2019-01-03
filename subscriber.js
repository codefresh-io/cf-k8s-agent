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
            const stream = resource.getStream();
            console.log(new Date().toISOString(), `stream ${key} start`);

            stream.on('close', () => {
                console.log(new Date().toISOString(), `stream ${key} close`);
                delete _this.resources[stream.ownerResource];
            });

            return Kefir.fromEvents(stream, 'data');
        });

        this.mergedStream = Kefir.merge(obss);
        this.mergedStream.onValue(async (obj) => {
            rp({
                method: 'POST',
                uri: `${config.apiUrl}/api/k8s-monitor/events`,
                body: obj,
                headers: {
                    'authorization': config.token,
                    'x-cluster-id': process.env.CLUSTER_ID,
                },
                json: true,
            }).catch(console.error);
        });

    }
}

module.exports = Subscriber;
