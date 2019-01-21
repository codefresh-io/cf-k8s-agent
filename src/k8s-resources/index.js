'use strict';

const Namespace = require('./resources/Namespace');
const Deployment = require('./resources/Deployment');
const Service = require('./resources/Service');
const Pod = require('./resources/Pod');

async function createResources(client) {
    return {
        namespace: new Namespace(client),
        deployment: new Deployment(client),
        service: new Service(client),
        pod: new Pod(client),
    };
}

module.exports = createResources;
