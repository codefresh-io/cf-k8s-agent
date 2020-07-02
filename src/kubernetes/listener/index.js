const PullListener = require('./pull');

class ListenerFactory {

    static async create() {

        return [new PullListener()];
    }

}

module.exports = ListenerFactory;
