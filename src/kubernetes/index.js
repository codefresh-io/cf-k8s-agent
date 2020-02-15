const _ = require('lodash');
const Promise = require('bluebird');

const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');
const { clientFactory, resolveConfig } = require('./client');
const logger = require('../logger');

const kubeManager = new KubeManager(resolveConfig());

async function prepareService(service) {
    const namespace = _.get(service, 'metadata.namespace');
    const name = _.get(service, 'metadata.name');
    logger.info(`Process service ${name} and get detailed info in ${namespace}`);
    const serviceController = kubeManager.getServiceController(namespace);
    try {
        return await serviceController.describeFull(name, namespace);
    } catch (error) {
        logger.info(`Process service ${name} in ${namespace} was failed`);
        logger.info(error.stack);
    }
    return Promise.resolve();

}

async function createPod(namespace = 'default', release, revision) {
    const pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: `rollback-${release}-${revision}`,
            labels: {
                provisionedBy: 'codefresh-agent'
            }
        },
        spec: {
            containers: [
                {
                    name: 'rollback',
                    image: 'codefresh/cf-k8s-agent-rollback',
                    command: ['helm', 'rollback'],
                    args: [release, revision]
                }
            ],
            restartPolicy: 'Never'
        }
    };
    const client = (await clientFactory());
    return client.api.v1.namespaces(namespace).pods.post({ body: pod });
}

async function clearCompletedPods(namespace = 'default') {
    const client = (await clientFactory());
    await client.api.v1.namespaces(namespace).pods
        .delete({ qs: { labelSelector: 'provisionedBy=codefresh-agent', fieldSelector: 'status.phase==Succeeded' } });
    return client.api.v1.namespaces(namespace).pods
        .delete({ qs: { labelSelector: 'provisionedBy=codefresh-agent', fieldSelector: 'status.phase==Failed' } });
}

module.exports = {
    clientFactory,
    kubeManager,
    prepareService,
    createPod,
    clearCompletedPods
};
