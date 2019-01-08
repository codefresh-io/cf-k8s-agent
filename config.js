'use strict';

module.exports = {
    token: process.env.CF_API_TOKEN || '5c2df2fddfc62d6c654d3d93.6d2824fb61a144963f75fea79ac900a2',
    apiUrl: process.env.CF_API_URL || 'http://dev-tunneler.codefresh.io/api/k8s-monitor/events?client=andrii-codefresh&service=cfrouter', // || 'http://local.codefresh.io/api/k8s-monitor/events',
};
