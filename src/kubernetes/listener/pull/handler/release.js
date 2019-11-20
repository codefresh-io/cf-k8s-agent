'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const releaseMetadataFactory = require('../../../../factory/release.metadata.factory');
const logger = require('../../../../logger');

class ReleaseHandler {

    async handle(kind, items) {
        const codefreshApi = require('../../../../api/codefresh.api');

        logger.info(`Prepare to send ${items.length} ${kind}s`);

        await codefreshApi.clearInfo({
            kind: 'Release'
        });

        for (const item of items) {
            item.kind = 'Release';
            const release = await releaseMetadataFactory.create(item, codefreshApi.getMetadataFilter())
                .catch(e => logger.error(e));
            if (_.get(release, 'object.release')) {
                return codefreshApi.sendPackageWithoutLock([{
                    object: release.object,
                    type: 'ADDED',
                    counter: 1,
                    kind: 'Release'
                }]);
            }
        }

        return Promise.resolve();
    }

}
module.exports = new ReleaseHandler();
