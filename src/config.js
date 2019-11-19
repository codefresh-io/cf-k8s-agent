'use strict';

const packageJson = require('../package');

module.exports = {
    // Cluster credentials. Are used when agent started outside of cluster and useCurrentContext=false
    clusterUrl: process.env.CLUSTER_URL,
    clusterToken: process.env.CLUSTER_TOKEN,
    clusterCA: process.env.CLUSTER_CA,

    // Params for interacting with API
    token: '5d94c151baf0a2898aabc0e3.1742ac2268cddd7cecb078eb920b0927',
    //token: '5dd30fc61ae4cb89ceb737e9.b47eef87ae691847db8f2a13e0b18190',
    apiUrl: 'https://g.codefresh.io/api/k8s-monitor/events',
    clusterId: 'cl-4',
    accountId: process.env.ACCOUNT_ID,

    // Use current kubernetes context.
    // If true, you need to set active context before starting agent. kubectl config use-context <contextname>
    // If false, cluster credentials will be got from environment. CLUSTER_URL, CLUSTER_TOKEN, CLUSTER_CA
    useCurrentContext: process.env.USE_CURRENT_CONTEXT || false,

    // Interval for restoring stream from k8s cluster after error
    retryInterval: 2000,
    resetInterval: 60 * 1000 * 120,
    statisticsInterval: 60 * 1000 * 60, // 60 min
    stateInterval: 60 * 1000, // 1 min

    newrelic: {
        license_key: process.env.NEWRELIC_LICENSE_KEY
    },

    name: packageJson.name,
    env: process.env.NODE_ENV || 'kubernetes',

    port: 9020,
    logLevel: 'debug',
    forceDisableHelmReleases: process.env.FORCE_DISABLE_HELM_RELEASES || true,
    pullTimeout: 60 * 1000
};
