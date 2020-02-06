'use strict';

const _ = require('lodash');
const semaphore = require('semaphore')(1);

const config = require('../../../config');
const logger = require('../../../logger');

const releaseHandler = require('./handler/release');
const commonHandler = require('./handler/common');

/**
 * Class for monitoring cluster resources
 */
class EventsPuller {
    constructor(client, resources) {
        this.client = client;
        this.resources = resources;
    }

    /**
     * Gets all supported resources, creates streams for each of them,
     * merges them in one stream and handle events data from this stream
     * @returns {Promise<void>}
     */
    async subscribe() {
        _.entries(this.resources).map(async ([tp, resource]) => {

            async function handle() {
                const result = await resource.get();

                const { kind, items } = result.body;

                const normalizedKind = kind.replace('List', '');

                if (normalizedKind === 'ConfigMap' || normalizedKind === 'Secret') {
                    return semaphore.take(() => {
                        try {
                            return releaseHandler.handle(normalizedKind, items, semaphore);
                        } catch (e) {
                            semaphore.leave();
                            return Promise.resolve();
                        }
                    });
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
