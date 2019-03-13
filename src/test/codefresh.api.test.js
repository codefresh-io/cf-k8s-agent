'use strict';

/* eslint-disable global-require */


describe('testing api', () => {
    beforeEach(() => {
        jest.resetModules();
    });
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
    it('sendEvents', () => {
        jest.setTimeout(1000);
        const CodefreshAPI = jest.requireActual('../api/codefresh.api');
        const data = require('./resources.mock');
        jest.mock('request-promise', () => async (s) => {
            expect(s.body)
                .toHaveLength(10);
            return [require('./resources.mock')];
        });
        [...new Array(15)].forEach(() => {
            CodefreshAPI.sendEvents({
                type: 'ADDED',
                object: data,
            });
        });
    });
    it('updateHandler', (done) => {
        jest.unmock('request-promise');
        const CodefreshAPI = jest.requireActual('../api/codefresh.api');

        jest.mock('request-promise', () => () => {
            return {
                needUpdate: true,
            };
        });

        jest.setTimeout(1000);
        CodefreshAPI.updateHandler(() => {
            done();
        });
    }, 30000);
});
