const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('cookie-parser');
const Promise = require('bluebird');
const loggerMiddleware = require('morgan')('dev');
const logger = require('./logger');
const { version } = require('../package.json');
const codefreshAPI = require('./api/codefresh.api');
const config = require('./config');
const kubernetes = require('./kubernetes');

const metadataHolder = require('./filters/metadata.holder');
const ListenerFactory = require('./kubernetes/listener');
const TaskListener = require('./actions/task.listener');
const resourceHolder = require('./kubernetes/listener/pull/resource.holder');
const resourcesFactory = require('./k8s-resources');

// intervals
let statisticsInterval;
let stateInterval;

const { clientFactory } = kubernetes;

async function _prepareConfig() {
    const clusterConfig = await codefreshAPI.getClusterConfig(config.clusterId);
    config.helm3 = clusterConfig.helmVersion === 'helm3';
}

async function init() {
    try {
        // Register binded accounts
        await kubernetes.init();
        let accounts;
        try {
            accounts = process.env.ACCOUNTS ? JSON.parse(process.env.ACCOUNTS) : null;
            accounts = accounts && Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            accounts = null;
            logger.error(`Can't parse binded accounts. Only main account will be updating. Reason: ${error}`);
        }

        const client = await clientFactory();

        if (config.useConfig) {
            await _prepareConfig();
        }

        logger.info(`Running step with helm3=${config.helm3} support`);

        const metadata = await codefreshAPI.getMetadata();

        // Get instances for each resource and init cache for them
        const metadataFilter = await codefreshAPI.initEvents(accounts);
        metadataHolder.put(metadataFilter);

        console.log(`Clean: ${process.env.CLEAN}`);
        if (process.env.CLEAN === 'true') {
            logger.debug(`Exit after cleaning`);
            process.exit(0);
        }

        TaskListener.listen();

        const resources = await resourcesFactory(client, metadata);

        resourceHolder.set(resources);

        // Create listener for all resources and subscribe for cluster events
        const listeners = await ListenerFactory.create();
        await Promise.all(listeners.map((listener) => {
            return listener.start();
        }));

        return {
            client,
            monitor: codefreshAPI
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
        // Send statistics
        if (!statisticsInterval) {
            statisticsInterval = setInterval(monitor.sendStatistics, config.statisticsInterval);
        }
        // React on state got from monitor
        if (!stateInterval) {
            stateInterval = setInterval(monitor.checkState.bind(monitor, init), config.stateInterval);
        }
    })
    .catch(() => process.exit(1));

module.exports = app;
