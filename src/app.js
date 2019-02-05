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
const { initEvents } = require('./api/codefresh.api');

const { clientFactory, Listener } = require('./kubernetes');

async function init() {
    try {
        // Register binded accounts
        let accounts;
        try {
            accounts = process.env.ACCOUNTS ? JSON.parse(process.env.ACCOUNTS) : null;
            accounts = accounts && Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            accounts = null;
            global.logger.error(`Can't parse binded accounts. Only main account will be updating. Reason: ${error}`);
        }

        // Get instances for each resource and init cache for them
        const [client] = await Promise.all([clientFactory(), initEvents(accounts)]);

        // Create listener for all resources and subscribe for cluster events
        const listener = new Listener(client);
        await listener.subscribe();
    } catch (error) {
        global.logger.error(`Can't init agent. Reason: ${error}`);
        throw error;
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

init().then(() => global.logger.info(`Agent has started...`)).catch(() => process.exit(1));

module.exports = app;
