module.exports = {
    resources: {
        deployment: {
            path: 'apis.apps.v1.watch.deployments',
            projection: [
                'metadata.uid',
                'metadata.name',
                'metadata.namespace',
                'kind',
                'metadata.labels',
                'spec.replicas',
                'spec.revisionHistoryLimit',
                'status.conditions',
            ],
        },
        service: {
            path: 'api.v1.watch.services',
            projection: [
                'metadata.uid',
                'metadata.name',
                'metadata.namespace',
                'kind',
                'metadata.labels',
            ],
        },
        pod: {
            path: 'api.v1.watch.pods',
            projection: [
                'metadata.uid',
                'metadata.name',
                'metadata.namespace',
                'metadata.labels',
                'kind',
                'status.phase',
                'status.startTime',
                'status.containerStatuses',
            ],
        },
    },
};
