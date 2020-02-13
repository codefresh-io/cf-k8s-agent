const packageJson = require('../package');

module.exports = {
    // Cluster credentials. Are used when agent started outside of cluster and useCurrentContext=false
    clusterUrl: process.env.CLUSTER_URL || 'https://35.222.155.232',
    clusterToken: process.env.CLUSTER_TOKEN || 'eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4ta3pjd2ciLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjA0ODliNjZhLTJmYzMtMTFlYS05OWU2LTQyMDEwYTgwMDE2OCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.WZKjl77yqhFU_BY0OKFMvFA8pzJMvBphVYltxkf4pAtZW_GYoRGlRXSZMJVqivFFff-k93Lwr-h-RN4niGm_1CWC8Bmiqrm0rM_TSVPow99Q6YWQtkx7MFvWTeOSIabi3JyNFk3CB7894yM-Ux_HVS1nv97TSOA_ND65zzZfmjIm3WLIxassDsALzWuTo_4gGXWHeOwAI5ZMtQjtpKoSZNynXaCVyNShWaYVnfX4T71bMfaPV_Wn1WbL1FUi0sKnp4DOsImYiRyJ_0qgcTL4i68XKTvqvYaxKr6qAkT6xIj8gXJG2ikodWn9kokc4YXMSixmefYwzUXf88s2hw_Prg',
    clusterCA: process.env.CLUSTER_CA || 'TFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVUkRla05EUVdaUFowRjNTVUpCWjBsUlpFeHlNMEZMSzNka2N6QnhhSFJhYjJaRllWUXZSRUZPUW1kcmNXaHJhVWM1ZHpCQ1FWRnpSa0ZFUVhZS1RWTXdkMHQzV1VSV1VWRkVSWGxTYTFsdFZUQk9WRUV6V2tNd2VGcFVWbXhNVkZGM1RtMUZkRmxxVG14T1V6QTBXVmRWZUZwVWEzbE5lazB3V1RKWmR3cElhR05PVFdwQmQwMVVRVEZOVkVreFRYcEJORmRvWTA1TmFsVjNUVlJCZWsxVVRURk5la0UwVjJwQmRrMVRNSGRMZDFsRVZsRlJSRVY1VW10WmJWVXdDazVVUVROYVF6QjRXbFJXYkV4VVVYZE9iVVYwV1dwT2JFNVRNRFJaVjFWNFdsUnJlVTE2VFRCWk1sbDNaMmRGYVUxQk1FZERVM0ZIVTBsaU0wUlJSVUlLUVZGVlFVRTBTVUpFZDBGM1oyZEZTMEZ2U1VKQlVVUklRbEkyYTJvemIyMUJlWGh5ZVVOSkswaEdhazlSUW1wb09FTldlRkZYTXpRek9HbDVSakkzTWdwWmF6YzVkWE5uVlVReE1IaHdkMFkzVms5VVNVeHBPSHBHYzNRMVUwa3hSa1Z2SzIwNWFscFpUVXR1YXprd2RIbHFjRmhzWjA5UmJuQlhlV0pSWldRd0NrTmphbmRHUmt4cGIybDZObUZUVVVKdFoyeGpTazFWVFhOeGEwbDFaaXRCYVZaUWFrVTFabmhoVUVkQloxVTVVbE56ZFRVelFtdElSekF3YkhabGFuZ0tjMmRDVTFreE5UZFdjMVo0ZFhsV2JITnJjMmR3UkdoRVVpc3hhamhvTVZoS01VVnVSMWxFUVRjeldHdFlaVWhhTUc4eFpWcEVRVlpoUjJnMmVtRjFjd3BSYTAwNFdrdEdSMGRsUTNCaWNGSnFlU3NyWVRSU2VuQmhjVUpXSzNOSlVGY3JSR2g2TWpCbk1tMTNUVzk1TkZZd1FsQlJUMDFxZG1jMFZYQXdNbWxZQ2pkemNFSjJlVmhUY2psR2RFMUJka04xWWxOTlZuY3ZWMXB6UmtSd1JrWjBZMlpQVTJSQ1lVSkdja2xLUVdkTlFrRkJSMnBKZWtGb1RVRTBSMEV4VldRS1JIZEZRaTkzVVVWQmQwbERRa1JCVUVKblRsWklVazFDUVdZNFJVSlVRVVJCVVVndlRVRXdSME5UY1VkVFNXSXpSRkZGUWtOM1ZVRkJORWxDUVZGQmNncFlhVFo0VldsT1J5OVhTbTFxTDFSd2VVTnNlWFJ2ZVZsMFkyTmxPRGxOVlZkTGJqbDRaM3BpYUVaQ2IxaHNjbTlsZG5JeVYxRjFkRVV2ZUZOWFUyWlBDbk55Wlc0eVRXUjVjSGMwZFZOV09HeDZXRU5UY2twWWFEWmpiRk14TmpCR05tOVFaVEJEZWpWdWR6UjFTVzFvZG5adVkwSkZOMmRUU3pWSE5XUnJiWGdLUjFkUVMzTnlSbTVuTlRGdFpITnlSblpPUTA1ME1GTkJTbmRPUzFJeE1EazNWbTB5ZEVaT2RYZHhMelI1T1VGb1pXWnRZVEJpVEhkMGNDOXNTbGx5WlFwU2VtdFhkbWxzWTFWVmJFRlBSVUZwUjJJclpXUXliaTgyY2xSSVJuTTRkMmRMTVZSSlkySXlMekl6UjBOM2VrWktTREpXVkRsSFR6Z3ZWR0pIVm5wc0NrVkVWMnBrSzJGTFpsVlVORTFqTUdGbE5WRkhMM2x4ZVVwMlJsVXlNRFZvSzBkNlVuSnFLemR1VGl0b1luZENibFEzV1RGNVRsQjVjREkyWlhjNFUwRUtNVWRDVGpGbWNVOUNjWEpEYzJ4TE5XdDRiVXNLTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW8=',

    // Params for interacting with API
    token: '5e43082e05f4ee7cbca3b3c3.29d250a5ef8cc55d5d77931f340bf635',
    //token: '5dd30fc61ae4cb89ceb737e9.b47eef87ae691847db8f2a13e0b18190',
    apiUrl: 'http://local.codefresh.io/api/k8s-monitor/events',
    clusterId: 'helm2',
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

    optimizeRelease: process.env.OPTIMIZE_RELEASE || true

};
