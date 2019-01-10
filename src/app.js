'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const logger = require('morgan');

const { getClient, Subscriber } = require('./kubernetes');

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

init().then(() => console.log(JSON.stringify(process.env))).catch(console.error);

module.exports = app;
