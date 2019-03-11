'use strict';

/* eslint-disable global-require */




describe('testing api', () => {
    it('metadata', async () => {
        const CodefreshAPI = jest.requireActual('../api/codefresh.api');
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        expect(await CodefreshAPI.getMetadata())
            .toBe(require('./metadata.mock'));
    });

    it('init', async () => {
        const CodefreshAPI = jest.requireActual('../api/codefresh.api');
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        expect(await CodefreshAPI.initEvents())
            .toBe(undefined);
    });
    it('sendEvents', async () => {
        const CodefreshAPI = jest.requireActual('../api/codefresh.api');
        const data = require('./resources.mock');
        jest.mock('request-promise', () => () => {
            return [require('./resources.mock')];
        });
        expect(await CodefreshAPI.sendEvents(data))
            .toBe(undefined);
    });
});
