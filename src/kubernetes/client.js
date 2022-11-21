const _ = require('lodash');
const { Client, config: kubeConfig } = require('kubernetes-client');
const k8s = require('@kubernetes/client-node');
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

function _convertK8sConfigToCluster(k8sConfig) {
    return {
        caData: _.get(k8sConfig, 'ca'),
        server: _.get(k8sConfig, 'url'),
        skipTLSVerify: k8sConfig.insecureSkipTlsVerify,
    };
}

function _convertK8sConfigToUser(k8sConfig) {
    return {
        token: _.get(k8sConfig, 'auth.bearer'),
        certData: _.get(k8sConfig, 'cert'),
        keyData: _.get(k8sConfig, 'key'),
    };
}

/**
 * Creates client for working with cluster
 * @returns {Promise<KubernetesClient.Client>}
 */
async function clientFactory() {
    const k8sConfig = resolveConfig();
    if (config.useK8sClient) {
        const kc = new k8s.KubeConfig();
        if (!config.clusterUrl) {
            kc.loadFromCluster();
        } else {
            const cluster = _convertK8sConfigToCluster(k8sConfig);
            const user = _convertK8sConfigToUser(k8sConfig);
            kc.loadFromClusterAndUser(cluster, user);
        }
        const coreApi = kc.makeApiClient(k8s.CoreV1Api);
        const appsApi = kc.makeApiClient(k8s.AppsV1Api);

        return { coreApi, appsApi, newClient: true };
    }

    const client = new Client({ config: k8sConfig });
    await client.loadSpec();
    return client;
}

module.exports = {
    clientFactory,
    resolveConfig,
};
