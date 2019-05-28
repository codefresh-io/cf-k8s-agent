'use strict';

const _ = require('lodash');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const ConfigMapEntity = require('@codefresh-io/kube-integration/lib/kube-native/configMap/configMap');
const { clientFactory, resolveConfig } = require('./client');
const Listener = require('./listener');

const kubeManager = new KubeManager(resolveConfig());

async function prepareRelease(rawConfigMap) {
    const configMap = new ConfigMapEntity(rawConfigMap);
    const releaseController = kubeManager.getReleaseController('kube-system');
    let release;
    const releaseName = _.get(configMap.getLabels(), 'NAME');
    if (releaseName) {
        release = await releaseController.describe(releaseName);
        const orderedHistory = _.orderBy(release._history, 'version');
        release._history = _.takeRight(orderedHistory, 20);
    }
    if (release && +release._version <= +configMap.getLabels().VERSION) {
        const releaseData = release.getFullData();
        const { name, version } = releaseData;
        const chartFiles = await releaseController.getChartDescriptorForRevision(name, version);
        const chartManifest = await releaseController.getChartManifestForRevision(name, version);
        const chartValues = await releaseController.getChartValuesForRevision(name, version);
        return { ...releaseData, chartFiles, chartManifest, chartValues };
    } else {
        return null;
    }
}

async function prepareService(service) {
    const namespace = _.get(service, 'metadata.namespace');
    const name = _.get(service, 'metadata.name');
    const serviceController = kubeManager.getServiceController(namespace);
    const prepared = await serviceController.describeFull(name, namespace);
    return prepared;
}

module.exports = {
    clientFactory,
    Listener,
    kubeManager,
    ConfigMapEntity,
    prepareRelease,
    prepareService,
};
