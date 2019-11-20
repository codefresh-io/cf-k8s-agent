const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('../../../../logger');

class CommonHandler {

    async handle(kind, items) {
        const codefreshApi = require('../../../../api/codefresh.api');

        const normalizedItems = items.map((item) => {
            return {
                object: {
                    metadata: item.metadata,
                    spec: item.spec,
                    status: item.status,
                    kind
                },
                type: 'ADDED',
                counter: 1
            };
        });

        logger.info(`Prepare to send ${normalizedItems.length} ${kind}s`);

        await codefreshApi.clearInfo({
            kind
        });

        const chunks = _.chunk(normalizedItems, 20);
        return Promise.map(chunks.map((chunk) => {
            return codefreshApi.sendPackageWithoutLock(chunk);
        }), (job) => { return job; }, { concurrency: 5 });
    }

}
module.exports = new CommonHandler();
