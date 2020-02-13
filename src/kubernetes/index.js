const _ = require('lodash');
const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const { clientFactory, resolveConfig } = require('./client');

const kubeManager = new KubeManager(resolveConfig());

function prepareService(service) {
    const namespace = _.get(service, 'metadata.namespace');
    const name = _.get(service, 'metadata.name');
    const serviceController = kubeManager.getServiceController(namespace);
    return serviceController.describeFull(name, namespace);
}

async function createPod(namespace = 'default') {
    const pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: 'rollback-pod'
        },
        spec: {
            containers: [
                {
                    name: 'ubuntu',
                    image: 'ubuntu:trusty',
                    command: ['echo'],
                    args: ['Hello world']
                }
            ]
        }
    };
    const client = (await clientFactory());
    return client.api.v1.namespaces(namespace).pods.post({ body: pod });
}

module.exports = {
    clientFactory,
    kubeManager,
    prepareService,
    createPod
};
