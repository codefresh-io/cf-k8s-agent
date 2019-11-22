const config = require('../../config');
const StreamListener = require('./stream/k8s-stream-listener');
const PullListener = require('./pull');

class ListenerFactory {

    static create(client, metadata, sender) {
        if (config.enablePull) {
            return new PullListener(client, metadata, sender);
        }
        return new StreamListener(client, metadata, sender);
    }

}

module.exports = ListenerFactory;
