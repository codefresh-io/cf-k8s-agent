const _ = require('lodash');
const semaphore = require('semaphore')(1);

const config = require('../../../config');
const logger = require('../../../logger');

const releaseHandler = require('./handler/release');
const commonHandler = require('./handler/common');
const resourceHolder = require('./resource.holder');

let intervalObj;

/**
 * Class for monitoring cluster resources
 */
class EventsPuller {

    /**
     * Gets all supported resources, creates streams for each of them,
     * merges them in one stream and handle events data from this stream
     * @returns {Promise<void>}
     */
    async handle(tp, resource) {
        logger.info(`Start handle ${tp}`);
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

    start() {
        if (intervalObj) {
            logger.info('Can`t start puller, already running');
            return;
        }

        const that = this;

        const resourcesCopy = _.cloneDeep(resourceHolder.get());

        if (config.helm3) {
            delete resourcesCopy.configmap;
        } else {
            delete resourcesCopy.secret;
        }

        _.entries(resourcesCopy).map(async ([tp, resource]) => {

            if (config.disableHelm === 'true' && (resource.type === 'configmap' || resource.type === 'secret')) {
                logger.info('Skip process release events');
                return null;
            }

            const defaultInterval = _.get(config, 'intervals.common',  60 * 1000);
            const interval = _.get(config, `intervals.${resource.type}`, defaultInterval);

            logger.info(`Setup update interval for resource ${resource.type} in ${interval} ms`);

            intervalObj = setInterval(() => {
                that.handle(tp, resource);
            }, interval);

            return null;

        });
    }

    stop() {
        if (intervalObj) {
            logger.info('Stop puller');
            clearInterval(intervalObj);
            intervalObj = undefined;
        }
    }

    restart() {
        this.stop();
        this.start();
    }

}

module.exports = EventsPuller;
