const Promise = require('bluebird');

const kubernetes = require('../kubernetes');
const codefreshAPI = require('../api/codefresh.api');
const logger = require('../logger');
const config = require('../config');

class TaskListener {

    listen() {

        logger.info(`Start listen and process events for rollback in namespace ${config.namespace}`);

        async function handle() {
            const tasks = await codefreshAPI.getPendingTasks();

            await Promise.all(tasks.map((task) => {
                const { namespace, release, revision } = task.context;
                return kubernetes.createPod(config.namespace, release, revision)
                    .catch((error) => {
                        logger.error(`Cant create pod ${namespace}, ${release}, ${revision}, ${error.stack}`);
                    });
            }));

        }

        setInterval(() => {
            handle();
            kubernetes.clearCompletedPods(config.namespace);
        }, 10000);
    }

}
module.exports = new TaskListener();
