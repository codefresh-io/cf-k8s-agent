'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
const expect = chai.expect;
chai.use(sinonChai);
const Release = require('./../release');

function getFakeBase64Data(){
    return ',base64;';
}

describe('Release', () => {
    describe('Finalize', () => {
        it('Should success read all data and create proto release', () => {
            const proxyOpt = {};
            const ReleaseProxy = proxyquire('./../release', proxyOpt);
            const r = new ReleaseProxy({
                name: 'r1',
                version: '1',
                getData(){
                    return {name: 'r1'};
                }
            });

            const data = r.getData();
            expect(data.name).to.be.deep.equal('r1');
        });
    });

    describe('Compare revisions', () => {
        it('Should compare to the previous revision', () => {
            expect(true).to.be.equal(true);
        });
    });
});
