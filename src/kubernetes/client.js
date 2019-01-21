'use strict';

const { Client, config: kubeConfig } = require('kubernetes-client');
const config = require('../config');

async function clientFactory() {
    let conf;
    if (config.clusterUrl) {

        // Run outside cluster
        if (config.useCurrentContext) {

            // Use current context
            conf = kubeConfig.fromKubeconfig();

        } else {

            // Use auth from environment
            conf = {
                url: config.clusterUrl,
                auth: {
                    bearer: config.clusterToken,
                },
                ca: config.clusterCA,
            };

        }

    } else {

        // Run inside cluster
        conf = kubeConfig.getInCluster();

    }

    const client = new Client({ config: conf });
    await client.loadSpec();
    global.logger.debug(`Client config, ${JSON.stringify(conf)}`);
    return client;
}

module.exports = {
    clientFactory,
};
