const kubernetes = require('../kubernetes');

const logger = require('../logger');
const config = require('../config');

const rollbackHandler = require('./rollback.handler');
const refreshHandler = require('./refresh.handler');
const reloadConfigHandler = require('./reload-config.handler');

const HANDLERS = [rollbackHandler, refreshHandler, reloadConfigHandler];

class TaskListener {

    _handle() {
        HANDLERS.forEach(handler => handler.handle());
    }

    listen() {

        const that = this;
        logger.info(`Start listen and process events for rollback in namespace ${config.namespace}`);

        setInterval(() => {
            that._handle();
            kubernetes.clearCompletedPods(config.namespace);
        }, 40 * 1000);
    }

}
module.exports = new TaskListener();
