'use strict';

const PullListener = require('./pull');
const resourcesFactory = require('../../k8s-resources');

class ListenerFactory {

    static async create(client, metadata) {
        const { deployment, service, namespace, pod, configmap } = await resourcesFactory(client, metadata);
        return [new PullListener(client, { namespace, configmap, pod, deployment, service })];
    }

}

module.exports = ListenerFactory;
