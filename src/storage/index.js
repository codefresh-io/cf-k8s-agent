'use strict';

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
        return _.cloneDeep(this.events);
    }

    size() {
        return this.events.length;
    }

    clear() {
        this.events = [];
    }

}

module.exports = new Storage();
