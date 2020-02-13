const _ = require('lodash');

const Queue = require('./Queue');

const CAPACITY = 1000;

class Storage {

    constructor() {
        this.queue = new Queue(CAPACITY);
    }

    push(event) {
        this.queue.enqueue(event);
    }

    get() {
        return _.cloneDeep(this.queue.entries);
    }

    size() {
        return this.queue.size();
    }

    clear() {
        this.queue.clear();
    }

}

module.exports = new Storage();
