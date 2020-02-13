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
