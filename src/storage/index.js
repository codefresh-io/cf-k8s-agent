const _ = require('lodash');

class Storage {

    constructor() {
        this.events = [];
    }

    push(event){
        this.events.push(event);
    }

    pushMany(events){
        this.events.push(...events);
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
