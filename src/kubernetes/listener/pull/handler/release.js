const Promise = require('bluebird');
const _ = require('lodash');

const releaseMetadataFactory = require('../../../../factory/release.metadata.factory');
const logger = require('../../../../logger');

class ReleaseHandler {

    async handle(kind, items) {
        const codefreshApi = require('../../../../api/codefresh.api');

        const extendedItems = await Promise.all(items.map((item) => {
            item.kind = 'Release';
            return releaseMetadataFactory.create(item, codefreshApi.getMetadataFilter()).catch(e => logger.error(e));
        }));

        const filtered = extendedItems.filter(item => item && item.object && item.object.release);

        logger.info(`Prepare to send ${filtered.length} ${kind}s`);

        await codefreshApi.clearInfo({
            kind: 'Release'
        });
        const chunks = _.chunk(filtered, 1);
        return Promise.map(chunks.map((chunk) => {
            return codefreshApi.sendPackageWithoutLock([{
                object: _.head(chunk).object,
                type: 'ADDED',
                counter: 1,
                kind: 'Release'
            }]);
        }), (job) => { return job; }, { concurrency: 5 });

    }

}
module.exports = new ReleaseHandler();
