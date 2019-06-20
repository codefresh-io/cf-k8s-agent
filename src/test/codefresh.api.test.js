'use strict';

/* eslint-disable global-require */

const rp = require('request-promise');

jest.mock('request-promise', () => jest.fn());

describe('testing api', () => {
    it('metadata', async () => {
        rp.mockImplementation(async () => require('./metadata.mock'));
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        expect(await codefreshAPI.getMetadata())
            .toBe(require('./metadata.mock'));
    });

    it('init', async () => {
        rp.mockImplementation(async () => require('./metadata.mock'));
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        expect(await codefreshAPI.initEvents())
            .toBe(undefined);
    });

    it('sendEvents', async () => {
        rp.mockImplementation(async () => [require('./resources.mock')]);
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI({
            prepareDeployment: () => null,
        });
        const data = require('./resources.mock');
        expect(await codefreshAPI.sendEvents(data))
            .toBe(undefined);
    });

    it('sendStatistics', async () => {
        rp.mockImplementation(() => Promise.resolve());
        const CodefreshAPI = require('../api/codefresh.api');
        const codefreshAPI = new CodefreshAPI();
        const response = await codefreshAPI.sendStatistics({});
        expect(response).toBe(undefined);
    });
});
