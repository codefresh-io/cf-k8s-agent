'use strict';

const _ = require('lodash');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const { clientFactory, resolveConfig } = require('./client');
const ListenerFactory = require('./listener');

const kubeManager = new KubeManager(resolveConfig());


function formatLabels(labels) {
    return _.toPairs(labels).map(([key, value]) => `${key}=${value}`).join(',');
}

function prepareService(service) {
    const namespace = _.get(service, 'metadata.namespace');
    const name = _.get(service, 'metadata.name');
    const serviceController = kubeManager.getServiceController(namespace);
    return serviceController.describeFull(name, namespace);
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
        .map((sp) => sp.toJson())
        .then(_.flatten);

    return prepared;
}

module.exports = {
    clientFactory,
    ListenerFactory,
    kubeManager,
    prepareService,
    prepareDeployment,
    preparePod,
};
