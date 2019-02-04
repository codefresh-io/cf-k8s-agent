'use strict';

const { expect } = require('chai');
const MetadataFilter = require('../filters/MetadataFilter');

describe('test MetadataFilter', () => {
    it('should return filtered value', () => {
        const object = {
            key1: 'val1',
            key2: 'val2',
            key3: 'val3',
            kind: 'Deployment',
        };

        const metadata = {
            projection: {
                Deployment: ['key1', 'key3'],
            },
        };

        const metadataFilter = new MetadataFilter(metadata);
        expect(metadataFilter.buildResponse(object, object.kind)).to.eql({
            key1: 'val1',
            key3: 'val3',
        });
    });
});
