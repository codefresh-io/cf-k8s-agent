'use strict';

module.exports = {
    // Cluster credentials. Are used when agent started outside of cluster and useCurrentContext=false
    clusterUrl: process.env.CLUSTER_URL,
    clusterToken: process.env.CLUSTER_TOKEN,
    clusterCA: process.env.CLUSTER_CA,
    monitorUrl: process.env.MONITOR_URL,
    clusterId: process.env.CLUSTER_ID,
    userId: process.env.USER_ID,

    // Use current kubernetes context.
    // If true, you need to set active context before starting agent. kubectl config use-context <contextname>
    // If false, cluster credentials will be got from environment. CLUSTER_URL, CLUSTER_TOKEN, CLUSTER_CA
    useCurrentContext: process.env.USE_CURRENT_CONTEXT || false,

    // Interval for restoring stream from k8s cluster after error
    retryInterval: 2000,
};
