
const _ = require('lodash');
const logger = require('../logger');

class ReleaseFactory {

    async buildReleaseMetadata(payload, metadataFilter) {
        const kubernetes = require('../kubernetes');
        const preparedRelease = await kubernetes.prepareRelease(payload);
        if (preparedRelease) {
            const filteredFields = metadataFilter ? metadataFilter.buildResponse(preparedRelease, 'release') : preparedRelease;
            return {
                ...payload,
                kind: 'Release',
                release: {
                    ...filteredFields,
                },
            };
        }
        logger.debug(`Skip build release ,  entity ${JSON.stringify(payload)}`);
        return null;
    }

    async create(payload, metadataFilter) {
        let data = _.cloneDeep(payload);

        let filteredMetadata = metadataFilter ? metadataFilter.buildResponse(payload, payload.kind) : payload;

        const releaseMetadata = await this.buildReleaseMetadata(payload);
        filteredMetadata = releaseMetadata ? releaseMetadata : filteredMetadata;


        data = {
            ...data,
            object: filteredMetadata,
        };

        delete data.object.data;

        return data;

    }

}

module.exports = new ReleaseFactory();
