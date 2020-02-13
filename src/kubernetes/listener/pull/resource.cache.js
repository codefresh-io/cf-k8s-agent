const _ = require('lodash');

class ResourceCache {

    constructor() {
        this.lastState = {
            Pod: [],
            Namespace: [],
            Deployment: []
        };

        this.currentState = {
            Pod: [],
            Namespace: [],
            Deployment: []
        };
    }

    put(id, resource) {
        _.get(this.currentState, resource, []).push(id);
    }

    includes(id, resource) {
        return _.includes(this.lastState[resource], id);
    }

    flush(resource) {
        const items = _.cloneDeep(this.currentState[resource]);
        if (!_.isEmpty(items)) {
            this.lastState[resource] = items;
        }
        this.currentState[resource] = [];
    }

}
module.exports = new ResourceCache();
