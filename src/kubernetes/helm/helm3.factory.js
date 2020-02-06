'use strict';

const { resolveConfig } = require('../client');

const _ = require('lodash');
const SecretEntity = require('@codefresh-io/kube-integration/lib/kube-native/secret/secret');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');

const kubeManager = new KubeManager(resolveConfig());

const releaseController = kubeManager.getReleaseHelm3Controller();

class Helm3Factory {

    async create(rawSecret) {
        const configMap = new SecretEntity(rawSecret);
        let release;
        const releaseName = _.get(configMap.getLabels(), 'name');
        if (releaseName) {
            release = await releaseController.describe(releaseName);
            const orderedHistory = _.orderBy(release._history, 'version');
            release._history = _.takeRight(orderedHistory, 20);
        }
        if (release && +release._version <= +configMap.getLabels().version) {
            const releaseData = release.getFullData();
            const { name, version } = releaseData;
            const chartFiles = await releaseController.getChartDescriptorForRevision(name, version);
            const chartManifest = await releaseController.getChartManifestForRevision(name, version);
            const chartValues = await releaseController.getChartValuesForRevision(name, version);
            return { ...releaseData, chartFiles, chartManifest, chartValues };
        }
        return null;

    }

}

module.exports = new Helm3Factory();
