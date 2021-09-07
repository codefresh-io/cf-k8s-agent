const logger = require('../logger');
const config = require('../config');

const refreshHandler = require('./refresh.handler');
const reloadConfigHandler = require('./reload-config.handler');

const HANDLERS = [refreshHandler, reloadConfigHandler];

class TaskListener {

    _handle() {
        HANDLERS.forEach(handler => handler.handle());
    }

    listen() {

        const that = this;
        logger.info(`Start listen and process events in namespace ${config.namespace}`);

        setInterval(() => {
            that._handle();
        }, 120 * 1000);
    }

}
module.exports = new TaskListener();
