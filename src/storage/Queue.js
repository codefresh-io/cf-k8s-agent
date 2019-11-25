'use strict';

class Queue {

    constructor(capacity) {
        this.capacity = capacity;
        this.entries = [];
    }

    enqueue(item) {
        if (this.entries.length >= this.capacity) {
            return { status: 'fail', reason: 'capacity is full' };
        }
        return this.entries.push(item);
    }

    get() {
        return this.entries;
    }

    size() {
        return this.entries.length;
    }

}

module.exports = Queue;
