const _ = require('lodash');

class MetadataFilter {

    constructor(metadata) {
        this.metadata = metadata;
        this.buildResponse = this.buildResponse.bind(this);
    }

    /**
     * Filtering fields based on metadata
     * @param data
     * @param resource - name of cluster resource
     * @return {{}}
     */
    buildResponse(data, resource) {
        let val = data;
        const projection = _.get(this, `metadata.resources.${resource.toLowerCase()}.projection`);

        if (_.isArray(projection)) {
            if (!projection.length) {
                return null;
            }

            val = projection.reduce((accumulator, item) => {
                return {
                    ...accumulator,
                    [item]: _.get(val, item),
                };
            }, {});
        }

        return val;
    }

}

module.exports = MetadataFilter;
