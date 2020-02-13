const _ = require('lodash');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const { clientFactory, resolveConfig } = require('./client');
const ListenerFactory = require('./listener');

const kubeManager = new KubeManager(resolveConfig());

function prepareService(service) {
    const namespace = _.get(service, 'metadata.namespace');
    const name = _.get(service, 'metadata.name');
    const serviceController = kubeManager.getServiceController(namespace);
    return serviceController.describeFull(name, namespace);
}

module.exports = {
    clientFactory,
    ListenerFactory,
    kubeManager,
    prepareService
};
