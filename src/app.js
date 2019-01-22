'use strict';

const { createLogger, transports, format } = require('winston');

const { combine, timestamp, printf } = format;

const myFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

global.logger = createLogger({
    level: 'debug',
    format: combine(timestamp(), myFormat),
    transports: [new transports.Console()],
});

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const loggerMiddleware = require('morgan')('dev');
const { clearEvents } = require('./api/codefresh.api');

const { clientFactory, Listener } = require('./kubernetes');

async function init() {
    try {
        // Get instances for each resource and clear cache for them
        const [client] = await Promise.all([clientFactory(), clearEvents()]);

        // Create listener for all resources and subscribe for cluster events
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

init().then(() => global.logger.info(`Agent has started...`));

module.exports = app;
