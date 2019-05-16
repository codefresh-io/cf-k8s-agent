'use strict';

const ReleaseController = require('./release/release.controller');

class Helm {
    constructor(client) {
        this.client = client;
    }

    async getReleaseByConfigMap(configmap) {
        // Check if configetReleaseByConfigMapgmap belongs to tiller
        const releaseController = new ReleaseController({
            kubeClient: this.client,
        });
        try {
            const release = await releaseController.getReleaseByConfigMap(configmap);
            return release;
        } catch (e) {
            console.error(e);
        }
        // get release
    }
}

module.exports = Helm;
