const _ = require('lodash');
const Promise = require('bluebird');

const releaseMetadataFactory = require('../../../../factory/release.factory');
const logger = require('../../../../logger');
const metadataHolder = require('../../../../filters/metadata.holder');
const config = require('../../../../config');
const releaseMerger = require('../../../helm/merger');
const codefreshApi = require('../../../../api/codefresh.api');

class ReleaseHandler {

    _optimizeReleases(release) {
        _.get(release, 'release.chartFiles', []).forEach((file) => {
            delete file.data;
        });
        delete release.release.chartManifest;
    }

    async handle(kind, items, semaphore) {

        logger.info(`Prepare to send ${items.length} ${kind}s`);

        await Promise.map(items, async (item) => {
            item.kind = 'Release';
            try {
                const release = await releaseMetadataFactory.create(item, metadataHolder.get())
                    .catch(e => logger.error(e));
                if (_.get(release, 'object.release')) {

                    if (config.optimizeRelease) {
                        this._optimizeReleases(release.object);
                    }

                    releaseMerger.updateAndGetLatest(release.object);
                }
            } catch (e) {
                logger.error(e.stack);
            }
        });

        if (!_.isEmpty(releaseMerger.releases)) {
            await codefreshApi.clearInfo({
                kind: 'Release'
            });
        }

        await Promise.each(_.values(releaseMerger.releases), async (latestRelease) => {
            logger.info(`Send release ${latestRelease.metadata.name}`);

            await codefreshApi.sendPackageWithoutLock([{
                object: latestRelease,
                type: 'ADDED',
                counter: 1,
                kind: 'Release'
            }]);
        });

        releaseMerger.clear();
        semaphore.leave();
        return Promise.resolve();
    }

}
module.exports = new ReleaseHandler();
