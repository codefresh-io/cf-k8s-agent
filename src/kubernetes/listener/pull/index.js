'use strict';

const _ = require('lodash');
const config = require('../../../config');
const resourcesFactory = require('../../../k8s-resources');
const logger = require('../../../logger');

const releaseHandler = require('./handler/release');
const commonHandler = require('./handler/common');



/**
 * Class for monitoring cluster resources
 */
class EventsPuller {
    constructor(client, metadata) {
        this.client = client;
        this.metadata = metadata;
        this.resources = {};
    }

    /**
     * Gets all supported resources, creates streams for each of them,
     * merges them in one stream and handle events data from this stream
     * @returns {Promise<void>}
     */
    async subscribe() {
        this.resources = await resourcesFactory(this.client, this.metadata);

        _.entries(this.resources).map(async ([tp, resource]) => {

            async function handle() {
                const result = await resource.get();

                const { kind, items } = result.body;

                const normalizedKind = kind.replace('List', '');

                if (normalizedKind === 'ConfigMap') {
                    return releaseHandler.handle(normalizedKind, items);
                }

                return commonHandler.handle(normalizedKind, items);
            }

            if (config.disableHelm === 'true' && resource.type === 'configmap') {
                logger.info('Skip process release events');
                return null;
            }

            const defaultInterval = _.get(config, 'intervals.common',  60 * 1000);
            const interval = _.get(config, `intervals.${resource.type}`, defaultInterval);

            logger.info(`Setup update interval for resource ${resource.type} in ${interval} ms`);

            setInterval(() => {
                handle();
            }, interval);

        });
    }
}

module.exports = EventsPuller;
