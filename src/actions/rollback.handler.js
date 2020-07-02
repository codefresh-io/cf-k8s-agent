const Promise = require('bluebird');

const codefreshAPI = require('../api/codefresh.api');
const logger = require('../logger');
const kubernetes = require('../kubernetes');
const config = require('../config');

class RollbackHandler {

    async handle() {
        const tasks = await codefreshAPI.getPendingTasks('rollback');

        await Promise.all(tasks.map((task) => {
            const { namespace, release, revision } = task.context;
            logger.info(`Start handle rollback task, ${release} ${revision} in namespace ${namespace}`);
            return kubernetes.createPod(config.namespace, release, revision, namespace)
                .catch((error) => {
                    logger.error(`Cant create pod ${namespace}, ${release}, ${revision}, ${error.stack}`);
                });
        }));
    }

}

module.exports = new RollbackHandler();
