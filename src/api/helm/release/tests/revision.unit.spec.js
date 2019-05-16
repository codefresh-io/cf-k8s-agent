'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
const Revision = require('./../revision');

const expect = chai.expect;
chai.use(sinonChai);

describe('revision', () => {
    function getFakeDataToInitiateRevision(){
        return {
            NAME: 'release-name',
            STATUS: 'DEPLOYED',
            VERSION: '1',
            MODIFIED_AT: 'some-time',
            CREATED_AT: 'some-time',
            dataAsBase64: ''
        };
    }

    function getProxyRevision() {
        return proxyquire('./../revision.js', {
            'zlib': {
                gunzip(data, cb) {
                    cb(null, new Buffer('fake'));
                }
            },
            './../../../_proto/hapi/release/release_pb': {
                Release: {
                    deserializeBinary() {
                        return {
                            toObject() {
                                return {

                                };
                            }
                        };
                    }
                }
            }
        });
    }

    it('should create new release', () => {
        const r = new Revision(getFakeDataToInitiateRevision());
        expect(r).to.have.all.keys(['_name', '_createdAt', '_modifiedAt', '_rawData', '_status', '_version']);
    });

    it('should init revision', () => {
        const RevisionProxy = getProxyRevision();
        const r = new RevisionProxy(getFakeDataToInitiateRevision());
        r.init()
        .then(() => {
            expect(r.decodedObject).to.exist;
        });
    });
});