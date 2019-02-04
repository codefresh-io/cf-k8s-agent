'use strict';

const _ = require('lodash');
const Kefir = require('kefir');
const proxyquire = require('proxyquire');
const { expect } = require('chai');

global.logger = {
    info: () => {},
};

const client = {};
_.set(client, 'apis.apps.v1.watch.deployments.getStream', () => streamFactory(50, 'b'));
_.set(client, 'api.v1.watch.services.getStream', () => streamFactory(40, 'c'));
_.set(client, 'api.v1.watch.pods.getStream', () => streamFactory(30, 'd'));

const expectation = [
    '30: d-1',
    '40: c-1',
    '50: b-1',
    '60: d-2',
    '80: c-2',
    '90: d-3',
    '100: b-2',
    '120: c-3',
    '120: d-4',
    '150: b-3',
    '150: d-5',
    '160: c-4',
    '200: b-4',
    '200: c-5',
    '250: b-5',
];

const streamData = [];

const Listener = proxyquire('../kubernetes/listener', {
    '../api/codefresh.api': {
        sendEvents: (data) => { streamData.push(data); },
    },
    'kefir': {
        fromEvents: stream => stream,
    },
});

function streamFactory(interval, prefix) {
    let i = 0;
    const stream = Kefir.withInterval(interval, (emitter) => {
        i++ < 5 ? emitter.emit(`${i * interval}: ${prefix}-${i}`) : emitter.end();
    });
    stream.pipe = () => stream;
    stream.on = () => {};
    return stream;
}

describe('streams', () => {
    it('check creating resources and merging streams', (done) => {
        const listener = new Listener(client);
        listener.subscribe().then(() => {
            listener.mergedStream.onEnd(() => {
                expect(streamData).to.have.members(expectation);
                expect(streamData).to.have.length(expectation.length);
                done();
            });
        });
    });
});
