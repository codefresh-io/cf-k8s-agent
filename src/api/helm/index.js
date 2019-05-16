'use strict';

const ReleaseController = require('./release/release.controller');
const cache = require('./release/cache');

class Helm {
    constructor(client) {
        this.client = client;
    }

    async getReleaseByConfigMap(configmap) {
        // Check if configetReleaseByConfigMapgmap belongs to tiller
        const releaseController = new ReleaseController({
            kubeClient: this.client,
        });
        return releaseController.getReleaseByConfigMap(configmap);
    }

    updateAndGetLatestRelease(release) {
        return cache.updateAndGetLatest(release);
    }
}

module.exports = Helm;
