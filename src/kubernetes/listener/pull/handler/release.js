const releaseMetadataFactory = require('../../../../factory/release.metadata.factory');
const _ = require('lodash');

class ReleaseHandler {

    async handle(kind, items) {
        const codefreshApi = require('../../../../api/codefresh.api');

        const extendedItems = await Promise.all(items.map((item) => {
            item.kind = 'Release';
            return releaseMetadataFactory.create(item, codefreshApi.getMetadataFilter()).catch(e => console.log(e));
        }));

        const filtered = extendedItems.filter(item => item && item.object && item.object.release);

        await codefreshApi.clearInfo({
            kind: 'Release'
        });

        const chunks = _.chunk(filtered, 1);
        return Promise.all(chunks.map((chunk) => {
            console.log(`Send chunk ${JSON.stringify(chunk[0].object)}`);
            return codefreshApi.sendPackageWithoutLock([{
                object: chunk[0].object,
                type: 'ADDED',
                counter: 1,
                kind: 'Release'
            }]);
        }));

    }

}
module.exports = new ReleaseHandler();
