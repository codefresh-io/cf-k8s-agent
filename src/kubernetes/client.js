'use strict';

const { Client, config: kubeConfig } = require('kubernetes-client');
const logger = require('../logger');
const config = require('../config');

function resolveConfig() {
    if (config.useCurrentContext) {
        // Use current context
        logger.debug(`Use current context`);
        return kubeConfig.fromKubeconfig();
    }
    if (!config.clusterUrl) {
        // Run inside cluster
        logger.debug(`Run inside cluster`);
        return kubeConfig.getInCluster();
    }
    // Use auth from environment
    logger.debug(`Use auth from environment`);
    return {
        url: config.clusterUrl,
        auth: {
            bearer: config.clusterToken,
        },
        ca: config.clusterCA,
        insecureSkipTlsVerify: true
    };
}

/**
 * Creates client for working with cluster
 * @returns {Promise<KubernetesClient.Client>}
 */
async function clientFactory() {
    const k8sConfig = resolveConfig();

    const client = new Client({ config: k8sConfig });
    await client.loadSpec();
    return client;
}

module.exports = {
    clientFactory,
    resolveConfig,
};
