'use strict';

global.logger = require('cf-logs').Logger('codefresh:k8sAgent');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const loggerMiddleware = require('morgan')('dev');
const { clearEvents } = require('./api/codefresh.api');

const { clientFactory, Listener } = require('./kubernetes');

async function init() {
    try {
        const [client] = await Promise.all([clientFactory(), clearEvents()]);
        const listener = new Listener(client);
        await listener.subscribe();
    } catch (error) {
        global.logger.error(`Can't init agent. Reason: ${error}`);
    }
}

const indexRouter = require('./api');

const app = express();

app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());

app.use('/', indexRouter);

init().then(() => global.logger.debug(`Agent has started with environment: ${JSON.stringify(process.env)}`));

module.exports = app;
