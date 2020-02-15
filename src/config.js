const packageJson = require('../package');

module.exports = {
    // Cluster credentials. Are used when agent started outside of cluster and useCurrentContext=false
    clusterUrl: process.env.CLUSTER_URL,
    clusterToken: process.env.CLUSTER_TOKEN,
    clusterCA: process.env.CLUSTER_CA,

    // Params for interacting with API
    token: process.env.API_TOKEN,
    apiUrl: process.env.API_URL,
    clusterId: process.env.CLUSTER_ID,
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
    logLevel: 'info',
    forceDisableHelmReleases: process.env.FORCE_DISABLE_HELM_RELEASES || false,
    intervals: {
        namespace: process.env.NAMESPACE_INTERVAL || 60 * 1000,
        pod: process.env.POD_INTERVAL || 5 * 60 * 1000,
        deployment: process.env.DEPLOYMENT_INTERVAL || 60 * 1000,
        configmap: process.env.RELEASE_INTERVAL || 10 * 60 * 1000,
        service: process.env.SERVICE_INTERVAL ||  60 * 1000,
        secret: process.env.SECRET_INTERVAL ||  60 * 1000,
        common: 60 * 1000
    },
    enablePull: true,
    disableHelm: process.env.DISABLE_HELM || false,
    helm3: process.env.HELM3 || false,
    namespace: process.env.NAMESPACE || 'default',
    optimizeRelease: process.env.OPTIMIZE_RELEASE || false

};
