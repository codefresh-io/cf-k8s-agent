'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
const expect = chai.expect;

chai.use(sinonChai);


class FakeConfigMap {

    getMetadata() {
        return {};
    }
    getLabels() {
        return {
            'NAME': Math.random()
        };
    }
    getProperty() {
        return {};
    }
};

function getFakeController() {
    return {
        describe() {
            return Promise.resolve({});
        },
        get() {
            return Promise.resolve([
                new FakeConfigMap({
                    name: 'r1'
                }), new FakeConfigMap({
                    name: 'r2'
                })
            ]);
        }
    };
}

function getFakeConstructorOptions() {
    return {
        kubeManager: {
            getServiceController: getFakeController,
            getConfigmapController: getFakeController,
            getPodController: getFakeController
        }
    };
}

describe('helm release controller', () => {
    describe('get:', () => {
        it('should get all releases', () => {
            const CtrlPrxy = proxyquire('./../release.controller', {
                './pool': function({ configmaps }){
                    this._configmaps = configmaps;
                    this._releases = [];
                    this.prepareReleases = () => {
                        this._releases.push({});
                        this._releases.push({});
                        return Promise.resolve();
                    };
                }
            });

            const ctrl = new CtrlPrxy(getFakeConstructorOptions());
            return ctrl.get()
                .then((releases) => {
                    expect(releases.length).to.be.equal(2);
                });
        });
    });

    describe('Tiller version', () => {
        it('Should get', () => {
            const CtrlPrxy = proxyquire('./../release.controller', {});
            const ctrl = new CtrlPrxy({
                kubeManager: {
                    getServiceController: () => {
                        return {
                            describe() {
                                return Promise.resolve({
                                    getServiceSelector: () => {
                                        return {
                                            app: 'helm',
                                            name: 'tiller'
                                        }
                                    }
                                });
                            }
                        }
                    },
                    getPodController: () => {
                        return {
                            get(filter) {
                                return [{
                                    getImages(){
                                        return [
                                            {
                                                name: 'gcr.io/kubernetes-helm/something:v1.0.0'
                                            },
                                            {
                                                name: 'gcr.io/kubernetes-helm/tiller:v2.5.1'
                                            }
                                        ]
                                    }
                                }];
                            }
                        };
                    }
                }
            });
            return ctrl.getTillerVersion()
                .then((version) => {
                    expect(version).to.be.deep.equal('v2.5.1');
                });
        });
    });
});
