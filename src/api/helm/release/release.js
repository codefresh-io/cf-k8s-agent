'use strict';

const _ = require('lodash');
const Revision = require('./revision');

class Release {

    constructor(firstRevision, tillerNamespace) {
        this._name = firstRevision.name;
        this._version = 0;
        this._history = [];
        this._chartName = _.get(firstRevision, '_decodedObject.chart.metadata.name');
        this._chartVersion = _.get(firstRevision, '_decodedObject.chart.metadata.version');
        this._namespace = _.get(firstRevision, '_decodedObject.namespace');
        this._tillerNamespace = tillerNamespace;
        this.addRevision(firstRevision);
    }

    get name() {
        return this._name;
    }

    addRevision(revision){

        if (revision.createdAt) {
            this._createdAt = revision.createdAt;
        }

        if (revision.status === Revision.commonProps.statusses.deployed){
            this._setRevisionAsRoot(revision);
        }

        if (parseInt(this._version) < revision.version){
            this._setRevisionAsRoot(revision);
        }


        this._history.push(revision);
    }

    _setRevisionAsRoot(revision) {
        this._status = revision.status;
        this._icon = _.get(revision.decodedObject, 'chart.metadata.icon');
        this._chart = `${_.get(revision.decodedObject, 'chart.metadata.name')}-${_.get(revision.decodedObject, 'chart.metadata.version')}`;
        this._sourcesList = _.get(revision.decodedObject, 'chart.metadata.sourcesList');
        this._description = _.get(revision.decodedObject, 'chart.metadata.description');
        this._info = revision.info;
        this._modifiedAt = revision.modifiedAt;
        this._version = revision.version;
        this._rootIsSet = true;
    }


    getData() {
        return  {
            history: this._history.map(revision => revision.getData()),
            chart: this._chart,
            icon: this._icon,
            sourcesList: this._sourcesList,
            description: this._description,
            info: this._info,
            status: this._status,
            createdAt: this._createdAt,
            modifiedAt: this._modifiedAt,
            version: this._version,
            name: this._name,
            chartName: this._chartName,
            chartVersion: this._chartVersion,
            namespace: this._namespace,
            tillerNamespace: this._tillerNamespace
        };
    }

    getRevisionByVersion(version) {
        if (version) {
            // return version
            return this._history.find(re => re.version === version);
        } else {
            // return latest
            return this._history.sort((a, b) => +b.version - +a.version)[0]
        }
    }
}

module.exports = Release;
