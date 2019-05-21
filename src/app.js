'use strict';

// const Promise = require('bluebird');
// const _ = require('lodash');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const loggerMiddleware = require('morgan')('dev');
const logger = require('./logger');
const { version } = require('../package.json');
const Monitor = require('./api/codefresh.api');
const config = require('./config');
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
            logger.error(`Can't parse binded accounts. Only main account will be updating. Reason: ${error}`);
        }

        const client = await clientFactory();
        const monitor = new Monitor();
        const metadata = await monitor.getMetadata();

        // Get instances for each resource and init cache for them
        await monitor.initEvents(accounts);

        console.log(`Clean: ${process.env.CLEAN}`);
        if (process.env.CLEAN === 'true') {
            logger.debug(`Exit after cleaning`);
            process.exit(0);
        }

        // Create listener for all resources and subscribe for cluster events
        const listener = new Listener(client, metadata, monitor.sendEvents);
        await listener.subscribe();

        return {
            client,
            monitor,
            listener,
        };
    } catch (error) {
        logger.error(`Can't init agent. Reason: ${error}`);
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

app.use('/api', indexRouter);

init()
    .then(({ monitor }) => {
        logger.info(`Agent ${version} has started...`);
        // Unconditional refresh
        setInterval(init, config.resetInterval);
        // Refresh by monitor trigger
        monitor.updateHandler(init);
    })
    .catch(() => process.exit(1));

module.exports = app;
