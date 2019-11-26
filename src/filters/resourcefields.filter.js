'use strict';

const metadataHolder = require('./metadata.holder');


class ResourceFieldsFilter {

    filter(item) {
        const metadataFilter = metadataHolder.get();
        return metadataFilter ? metadataFilter.buildResponse(item, item.kind) : item;
    }

}
module.exports = new ResourceFieldsFilter();
