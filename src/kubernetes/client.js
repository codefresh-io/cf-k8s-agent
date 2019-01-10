'use strict';

const { Client, config } = require('kubernetes-client');

async function getClient() {
    if (process.env.CLUSTER_URL) {
        const conf = {
            url: process.env.CLUSTER_URL,
            auth: {
                bearer: process.env.CLUSTER_TOKEN,
            },
            ca: process.env.CLUSTER_CA,
        };
        const client = new Client({ config: conf });
        // const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
        await client.loadSpec();
        return client;
    } else {
        const client = new Client({ config: config.getInCluster() });
        // console.log('config', JSON.stringify(config.getInCluster()));
        await client.loadSpec();
        return client;
    }
}

module.exports = {
    getClient,
};
