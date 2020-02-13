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

module.exports = {
    clientFactory,
    kubeManager,
    prepareService
};
