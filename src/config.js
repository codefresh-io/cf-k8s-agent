'use strict';

module.exports = {
    // Cluster credentials. Are used when agent started outside of cluster and useCurrentContext=false
    clusterUrl: process.env.CLUSTER_URL,
    clusterToken: process.env.CLUSTER_TOKEN,
    clusterCA: process.env.CLUSTER_CA,

    // Params for interacting with Codefresh API
    token: process.env.CF_API_TOKEN,
    apiUrl: process.env.CF_API_URL,
    clusterId: process.env.CLUSTER_ID,

    // Use current kubernetes context.
    // If true, you need to set active context before starting agent. cubectl config use-context <contextname>
    // If false, cluster credentials will be got from environment. CLUSTER_URL, CLUSTER_TOKEN, CLUSTER_CA
    useCurrentContext: process.env.USE_CURRENT_CONTEXT || false,

    // Interval for restoring stream after error
    retryInterval: 2000,
};
