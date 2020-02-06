'use strict';

const PullListener = require('./pull');
const resourcesFactory = require('../../k8s-resources');

class ListenerFactory {

    static async create(client, metadata) {
        const { secret, service, namespace } = await resourcesFactory(client, metadata);
        return [new PullListener(client, { secret, service, namespace })];
    }

}

module.exports = ListenerFactory;
