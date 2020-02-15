const Promise = require('bluebird');

const kubernetes = require('../kubernetes');
const codefreshAPI = require('../api/codefresh.api');
const logger = require('../logger');
const config = require('../config');

class TaskListener {

    async _handle() {
        const tasks = await codefreshAPI.getPendingTasks();

        await Promise.all(tasks.map((task) => {
            const { namespace, release, revision } = task.context;
            logger.info(`Start handle rollback task, ${release} ${revision} in namespace ${namespace}`);
            return kubernetes.createPod(config.namespace, release, revision, namespace)
                .catch((error) => {
                    logger.error(`Cant create pod ${namespace}, ${release}, ${revision}, ${error.stack}`);
                });
        }));

    }

    listen() {

        const that = this;
        logger.info(`Start listen and process events for rollback in namespace ${config.namespace}`);

        setInterval(() => {
            that._handle();
            kubernetes.clearCompletedPods(config.namespace);
        }, 10000);
    }

}
module.exports = new TaskListener();
