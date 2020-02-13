const _ = require('lodash');

const metadataHolder = require('../../../filters/metadata.holder');
const storage = require('../../../storage');
const statistics = require('../../../statistics');
const logger = require('../../../logger');
const config = require('../../../config');

const codefreshApi = require('../../../api/codefresh.api');


let counter = 1;


class Handler {

    constructor() {
        this.buildMetadata = this.buildMetadata.bind(this);
        this.sendEvents = this.sendEvents.bind(this);
    }


    /**
     * Send cluster event to monitor
     * @param payload - data for sending
     * @returns {Promise<void>}
     */
    async sendEvents(payload) {
        const metadataFilter = metadataHolder.get();

        let data = _.cloneDeep(payload);

        if (data.kind === 'Status') {
            logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        let filteredMetadata = metadataFilter ? metadataFilter.buildResponse(payload.object, payload.object.kind) : payload.object;

        const metadata = await this.buildMetadata(payload);
        if (metadata) {
            filteredMetadata = metadata;
        }

        if (!filteredMetadata) {
            return;
        }

        // Filtered and enriched data
        data = {
            ...data,
            object: filteredMetadata,
        };

        data.counter = counter++;

        logger.debug(`ADD event to package. Cluster: ${config.clusterId}. ${data.object.kind}. ${payload.object.metadata.name}. ${data.type}`);
        logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);

        storage.push(data);
        statistics.apply(data);
        statistics.incEvents();
        if (storage.size() >= 50) {
            await codefreshApi._sendPackage();
        } else {
            logger.info(`Skip packages sending - size ${storage.size()}`);
        }
    }

    async buildMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }
        return payload.object;
    }

}

module.exports = new Handler();
