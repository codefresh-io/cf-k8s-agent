'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const ConfigMapEntity = require('@codefresh-io/kube-integration/lib/kube-native/configMap/configMap');
const DeploymentEntity = require('@codefresh-io/kube-integration/lib/kube-native/deployment/deploy');
const { clientFactory, resolveConfig } = require('./client');
const Listener = require('./listener');

const kubeManager = new KubeManager(resolveConfig());

function formatLabels(labels) {
    return _.toPairs(labels).map(([key, value]) => `${key}=${value}`).join(',');
}

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
    return { data: JSON.stringify(prepared) };
}

async function prepareDeployment(rawDeployment) {
    const namespace = _.get(rawDeployment, 'metadata.namespace');
    const name = _.get(rawDeployment, 'metadata.name');
    const deploymentController = kubeManager.getDeploymentController(namespace);
    const deployment = await deploymentController.describe(name);
    return { data: JSON.stringify(deployment.getFullData()) };
}

async function preparePod(pod, getImageId) {
    const labelSelector = formatLabels(_.get(pod, 'metadata.labels', {}));
    const namespace = _.get(pod, 'metadata.namespace');
    const podController = kubeManager.getPodController(namespace);

    const prepared = await podController.group({ labelSelector })
        .map((sp) => {
            return Promise.map(sp.getImages(), (image) => {
                const { imageID, name } = image;
                return Promise.resolve(getImageId(imageID))
                    .then((imageId) => {
                        sp.setImageMetaData(name, 'id', imageId);
                        return sp;
                    })
                    .catchReturn(sp)
                    .then(() => sp.toJson());
            });
        })
        .then(_.flatten);

    return prepared;
}

module.exports = {
    clientFactory,
    Listener,
    kubeManager,
    ConfigMapEntity,
    prepareRelease,
    prepareService,
    prepareDeployment,
    preparePod,
};
