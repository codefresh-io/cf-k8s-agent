'use strict';

const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const ConfigMapEntity = require('@codefresh-io/kube-integration/lib/kube-native/configMap/configMap');
const { clientFactory, resolveConfig } = require('./client');
const Listener = require('./listener');

module.exports = {
    clientFactory,
    Listener,
    kubeManager: new KubeManager(resolveConfig()),
    ConfigMapEntity,
};
