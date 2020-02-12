'use strict';

const _ = require('lodash');

class Merger {
    constructor() {
        this.releases = {};
    }

    updateAndGetLatest(release) {
        if (!release) {
            return null;
        }

        const { name, resourceVersion } = release.metadata;
        const existing = this.releases[name];

        // If we got newer or same version - update cache and return updated value
        if (_.get(existing, `metadata.resourceVersion`, 0) <= resourceVersion) {
            this.releases[name] = release;
            return release;
        }

        return null;
    }

    clear() {
        this.releases = {};
    }
}

module.exports = new Merger();
