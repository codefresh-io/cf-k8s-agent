'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const logger = require('morgan');

const { Client, config } = require('kubernetes-client');
const Subscriber = require('./subscriber');


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
        // console.log('config', JSON.stringify(config.getInCluster()));
        await client.loadSpec();
        return client;
    }
}

async function init() {
    const client = await getClient();
    const subscriber = new Subscriber(client);
    await subscriber.subscribe();
}

const indexRouter = require('./api/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());

app.use('/', indexRouter);

init().catch(console.error);

module.exports = app;
