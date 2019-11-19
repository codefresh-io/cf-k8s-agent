const StreamListener = require('./k8s-stream-listener');
const PullListener = require('./k8s-pull-listener');

class ListenerFactory {

    static create(client, metadata, sender) {
        return new PullListener(client, metadata, sender);
    }

}

module.exports = ListenerFactory;
