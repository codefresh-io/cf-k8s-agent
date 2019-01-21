'use strict';

const {Client, config: kubeConfig} = require('kubernetes-client');
const config = require('../config');


function _resolveConfig() {
    if (!config.clusterUrl) {
        // Run inside cluster
        return kubeConfig.getInCluster();
    }
    if (config.useCurrentContext) {
        // Use current context
        return kubeConfig.fromKubeconfig();
    }
    // Use auth from environment
    return {
        url: config.clusterUrl,
        auth: {
            bearer: config.clusterToken,
        },
        ca: config.clusterCA,
    };
}

async function clientFactory() {
    const k8sConfig = _resolveConfig();

    const client = new Client({config: k8sConfig});
    await client.loadSpec();
    global.logger.debug(`Client config, ${JSON.stringify(k8sConfig)}`);
    return client;
}

module.exports = {
    clientFactory,
};
