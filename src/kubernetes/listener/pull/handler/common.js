const _ = require('lodash');

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

        await codefreshApi.clearInfo({
            kind
        });

        const chunks = _.chunk(normalizedItems, 20);
        return Promise.all(chunks.map((chunk) => {
            return codefreshApi.sendPackageWithoutLock(chunk);
        }));
    }

}
module.exports = new CommonHandler();
