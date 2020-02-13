const MetadataFilter = require('./MetadataFilter');

class MetadataHolder {

    put(metadata) {
        this.metadataFilter = new MetadataFilter(metadata);
    }

    get() {
        return this.metadataFilter;
    }

}

module.exports = new MetadataHolder();
