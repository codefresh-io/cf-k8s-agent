'use strict';

const _ = require('lodash');
const config = require('../../config');
const resourcesFactory = require('../../k8s-resources');
const releaseMetadataFactory = require('../../factory/release.metadata.factory');

/**
 * Class for monitoring cluster resources
 */
class EventsPuller {
    constructor(client, metadata) {
        this.client = client;
        this.metadata = metadata;
        this.resources = {};
    }

    /**
     * Gets all supported resources, creates streams for each of them,
     * merges them in one stream and handle events data from this stream
     * @returns {Promise<void>}
     */
    async subscribe() {
        const codefreshApi = require('../../api/codefresh.api');

        this.resources = await resourcesFactory(this.client, this.metadata);

        _.entries(this.resources).map(async ([tp, resource]) => {

            async function handle() {
                const result = await resource.get();

                const { kind, items } = result.body;

                const normalizedKind = kind.replace('List', '');

                if (normalizedKind === 'ConfigMap') {
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
                        console.log(`Send chunk ${JSON.stringify(...chunk[0].object)}`);
                        return codefreshApi.sendPackageWithoutLock([{
                            object: { ...chunk[0].object },
                            type: 'ADDED',
                            counter: 1,
                            kind: 'Release'
                        }]);
                    }));
                }

                const normalizedItems = items.map((item) => {
                    return {
                        metadata: item.metadata,
                        spec: item.spec,
                        status: item.status
                    };
                });

                await codefreshApi.clearInfo({
                    kind: normalizedKind
                });

                const chunks = _.chunk(normalizedItems, 20);
                return Promise.all(chunks.map((chunk) => {
                    return codefreshApi.sendAllInfo({
                        kind: normalizedKind,
                        items: chunk
                    });
                }));
            }

            await handle();

            setInterval(() => {
                handle();
            }, config.pullTimeout);

        });
    }
}

module.exports = EventsPuller;
