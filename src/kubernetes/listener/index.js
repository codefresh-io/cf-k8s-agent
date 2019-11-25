'use strict';

const StreamListener = require('./stream/k8s-stream-listener');
const PullListener = require('./pull');
const resourcesFactory = require('../../k8s-resources');

class ListenerFactory {

    static async create(client, metadata) {
        const { deployment, service, namespace, pod, configmap } = await resourcesFactory(client, metadata);
        return [new PullListener(client, { configmap, pod }), new StreamListener(client, { deployment, service, namespace })];
    }

}

module.exports = ListenerFactory;
