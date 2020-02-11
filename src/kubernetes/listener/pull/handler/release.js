'use strict';

const _ = require('lodash');

const releaseMetadataFactory = require('../../../../factory/release.factory');
const logger = require('../../../../logger');
const metadataHolder = require('../../../../filters/metadata.holder');
const config = require('../../../../config');

class ReleaseHandler {

    _optimizeReleases(release) {
        _.get(release, 'release.chartFiles', []).forEach((file) => {
            delete file.data;
        });
        delete release.release.chartManifest;
    }

    async handle(kind, items, semaphore) {
        const codefreshApi = require('../../../../api/codefresh.api');

        logger.info(`Prepare to send ${items.length} ${kind}s`);

        await codefreshApi.clearInfo({
            kind: 'Release'
        });

        for (const item of items) {
            item.kind = 'Release';
            try {
                const release = await releaseMetadataFactory.create(item, metadataHolder.get())
                    .catch(e => logger.error(e));
                if (_.get(release, 'object.release')) {

                    if (config.optimizeRelease) {
                        this._optimizeReleases(release.object);
                    }


                    logger.info(`Send release ${JSON.stringify(release.object)}`);

                    await codefreshApi.sendPackageWithoutLock([{
                        object: release.object,
                        type: 'ADDED',
                        counter: 1,
                        kind: 'Release'
                    }]);
                }
            } catch (e) {
                logger.error(e.stack);
            }

        }
        semaphore.leave();
        return Promise.resolve();
    }

}
module.exports = new ReleaseHandler();
