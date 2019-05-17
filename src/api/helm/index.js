'use strict';

const ReleaseController = require('./release/release.controller');
const cache = require('./release/cache');

class Helm {
    constructor(client) {
        this.client = client;
        this.releaseController = new ReleaseController({
            kubeClient: this.client,
        });
    }

    async getReleaseByConfigMap(configmap) {
        return this.releaseController.getReleaseByConfigMap(configmap);
    }

    getChartDescriptorForRevision(release) {
        return this.releaseController.getChartDescriptorForRevision(release);
    }

    getChartManifestForRevision(release) {
        return this.releaseController.getChartManifestForRevision(release);
    }

    getChartValuesForRevision(release) {
        return this.releaseController.getChartValuesForRevision(release);
    }

    updateAndGetLatestRelease(release) {
        return cache.updateAndGetLatest(release);
    }
}

module.exports = Helm;
