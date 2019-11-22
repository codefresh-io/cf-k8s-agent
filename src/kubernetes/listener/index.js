'use strict';

const StreamListener = require('./stream/k8s-stream-listener');
const PullListener = require('./pull');
const resourcesFactory = require('../../k8s-resources');

class ListenerFactory {

    static async create(client, metadata) {
        const { deployment, service, namespace, pod, configmap } = await resourcesFactory(client, metadata);
        return [new PullListener(client, { configmap }), new StreamListener(client, { deployment, service, namespace, pod })];
    }

}

module.exports = ListenerFactory;
