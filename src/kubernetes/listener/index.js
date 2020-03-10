const PullListener = require('./pull');
const resourcesFactory = require('../../k8s-resources');

class ListenerFactory {

    static async create(client, metadata) {
        const resources = await resourcesFactory(client, metadata);

        return [new PullListener(client, resources)];
    }

}

module.exports = ListenerFactory;
