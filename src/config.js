'use strict';

module.exports = {
    clusterUrl: process.env.CLUSTER_URL,
    clusterToken: process.env.CLUSTER_TOKEN,
    clusterCA: process.env.CLUSTER_CA,

    token: process.env.CF_API_TOKEN,
    apiUrl: process.env.CF_API_URL,
    clusterId: process.env.CLUSTER_ID,
    useCurrentContext: false,
};
