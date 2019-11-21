'use strict';

const metadataHolder = require('./metadata.holder');


class ResourceFilter {

    filter(item) {
        const metadataFilter = metadataHolder.get();
        return metadataFilter ? metadataFilter.buildResponse(item, item.kind) : item;
    }

}
module.exports = new ResourceFilter();
