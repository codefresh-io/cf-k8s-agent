'use strict';

/* eslint-disable global-require */


describe('testing api', () => {
    it('metadata', async () => {
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        // jest.mock('request-promise', () => () => {
        //     return require('./metadata.mock');
        // });
        expect(await codefreshAPI.getMetadata())
            .toBe(require('./metadata.mock'));
    });

    it('init', async () => {
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        expect(await codefreshAPI.initEvents())
            .toBe(undefined);
    });
    it('sendEvents', async () => {
        jest.mock('request-promise', () => () => {
            return [require('./resources.mock')];
        });
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        const data = require('./resources.mock');
        expect(await codefreshAPI.sendEvents(data))
            .toBe(undefined);
    });
});
