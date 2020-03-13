const Promise = require('bluebird');

const codefreshAPI = require('../api/codefresh.api');
const config = require('../config');
const logger = require('../logger');
const PullListener = require('../kubernetes/listener/pull');

const pullListener = new PullListener();

class ReloadConfigHandler {

    async _prepareConfig() {
        const clusterConfig = await codefreshAPI.getClusterConfig(config.clusterId);
        config.helm3 = clusterConfig.helmVersion === 'helm3';
    }

    async handle() {
        const tasks = await codefreshAPI.getPendingTasks('reload-config');

        await Promise.all(tasks.map(async () => {
            logger.info(`Start handle reload-config task`);
            await this._prepareConfig();
            pullListener.restart();
        }));
    }

}

module.exports = new ReloadConfigHandler();
