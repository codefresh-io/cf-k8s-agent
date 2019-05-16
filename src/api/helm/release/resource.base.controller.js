'use strict';

const _            = require('lodash');
const Promise      = require('bluebird');

class RecourseController {

    constructor({
        kubeClient,
        kubeManager,
        selector,
        baseKubePath,
        Entity,
        builders,
        StatusAnalyzerClass,
        ns
    }) {
        this._kube                = kubeClient;
        this._selector            = selector;
        this._baseKubePath        = baseKubePath;
        this._EntityClass         = Entity;
        this._builders            = builders || [];
        this._StatusAnalyzerClass = StatusAnalyzerClass;
    }

    getKubeClient() {
        return this._kube;
    }

    getClient() {
        return _.get(this.getKubeClient(), this._baseKubePath);
    }

    getSelector() {
        return this._selector;
    }

    getBuilder(name) {
        let Builder;
        this._builders.map((builder) => {
            if (name && builder.name === name) {
                Builder = builder.Type
            }

            if (!name && builder.isDefault) {
                Builder = builder.Type
            }
        });
        if (Builder) {
            return Builder;
        }
        throw new Error(`Builder ${name || 'default'} not found`);
    }

    get(filter) {
        const deferred = Promise.defer();
        this.getClient().get({ qs: filter }, (err, resourceList) => {
            const list = _.get(resourceList, 'items', []);
            if (err) {
                console.error(err);
                return deferred.reject(err);
            }
            Promise.map(list, (kubeResource) => {
                let status = {};
                if (this._StatusAnalyzerClass) {
                    status = new this._StatusAnalyzerClass(kubeResource,
                        resourceList.kind.replace('List', '')).analyze();
                }
                const entityInstance = new this._EntityClass(kubeResource, {
                    selector: this.getSelector(),
                    status
                });
                return entityInstance;
            })
                .then(_.compact)
                .then(deferred.resolve.bind(deferred))
                .catch(deferred.reject.bind(deferred))
                .done();
        });
        return deferred.promise;
    }

    describe(name) {
        const deferred = Promise.defer();
        _.get(this.getKubeClient(), this._baseKubePath)(name).get((err, kubeResource) => {
            if (err) {
                return deferred.reject(err);
            }
            let status = {};
            if (this._StatusAnalyzerClass) {
                status = new this._StatusAnalyzerClass(kubeResource, kubeResource.kind).analyze();
            }
            const entityInstance = new this._EntityClass(kubeResource, {
                selector: this.getSelector(),
                status
            });

            return deferred.resolve(entityInstance);

        });
        return deferred.promise;
    }
}

module.exports = RecourseController;
