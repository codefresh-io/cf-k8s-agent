'use strict';

const _ = require('lodash');

class Cache {
    constructor() {
        this.releases = {};
    }

    updateAndGetLatest(release) {
        if (!release) {
            return null;
        }

        const { name, version } = release;
        const existing = this.releases[name];

        // If we got newer or same version - update cache and return updated value
        if (_.get(existing, `version`, 0) <= version) {
            this.releases[name] = release;
            return release;
        }

        return null;
    }
}

module.exports = new Cache();
