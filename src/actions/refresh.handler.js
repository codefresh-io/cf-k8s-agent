const Promise = require('bluebird');

const codefreshAPI = require('../api/codefresh.api');
const config = require('../config');
const logger = require('../logger');
const PullListener = require('../kubernetes/listener/pull');
const resourceHolder = require('../kubernetes/listener/pull/resource.holder');

const pullListener = new PullListener();

class RefreshHandler {

    async handle() {
        const tasks = await codefreshAPI.getPendingTasks('refresh-releases');

        await Promise.all(tasks.map(() => {
            logger.info(`Start handle refresh-release task`);
            return pullListener.handle('releases', resourceHolder.get()[config.helmResourceKey()]);
        }));
    }

}

module.exports = new RefreshHandler();
