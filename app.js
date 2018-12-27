'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const logger = require('morgan');
const _ = require('lodash');
const Kefir = require('kefir');

const { Client } = require('kubernetes-client');
const { config } = require('kubernetes-client');
const JSONStream = require('json-stream');
const rp = require('request-promise');

const resources = require('./k8s-resources');

// let counter = 0;

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
        await client.loadSpec();
        return client;
    } else {
        const client = new Client({ config: config.getInCluster() });
        console.log('config', JSON.stringify(config.getInCluster()));
        await client.loadSpec();
        return client;
    }
}

async function watch(client) {
    const obss = _.values(resources.resources).map((resource) => {
        const stream = resource.getStream(client);
        return Kefir.fromEvents(stream, 'data');
    });

    const mergedStream = Kefir.merge(obss);
    mergedStream.onValue(async (obj) => {
        rp({
            method: 'POST',
            uri: `https://webhook.site/4717800e-cc87-4da0-a44b-585ef63e2531`,
            body: obj,
            json: true,
        }).then(console.log, console.error);
    });
}

const indexRouter = require('./api/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());

app.use('/', indexRouter);

getClient()
    .then(async (client) => {
        const namespaces = await client.api.v1.namespaces.get();
        console.log('namespaces:', JSON.stringify(namespaces));
        rp({
            method: 'POST',
            uri: `https://webhook.site/4717800e-cc87-4da0-a44b-585ef63e2531`,
            body: namespaces,
            json: true,
        }).then(console.log, console.error);
        return watch(client);
    })
    .catch(console.error);


module.exports = app;
