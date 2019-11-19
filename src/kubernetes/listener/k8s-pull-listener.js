'use strict';

const _ = require('lodash');
const config = require('../../config');
const resourcesFactory = require('../../k8s-resources');

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
                    // skip for now
                    return Promise.resolve();
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
                console.log('CALL TIMEOUT');
                handle();
            }, config.pullTimeout);

        });
    }
}

module.exports = EventsPuller;
