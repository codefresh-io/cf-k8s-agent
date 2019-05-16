'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const { gunzip } = require('zlib');
const YAML = require('js-yaml');
const ReleaseProto = require('../_proto/hapi/release/release_pb').Release;

class ReleaseRevision {

    constructor(data) {
        this._name = data[ReleaseRevision.commonProps.name];
        this._version = data[ReleaseRevision.commonProps.version];
        this._status = data[ReleaseRevision.commonProps.status];
        this._modifiedAt = data[ReleaseRevision.commonProps.modifiedAt];
        this._createdAt = data[ReleaseRevision.commonProps.createdAt];
        this._rawData = data.dataAsBase64;
    }

    get name() {
        return this._name;
    }

    get status() {
        return this._status;
    }

    get decodedObject() {
        return this._decodedObject;
    }

    get createdAt() {
        return this._createdAt;
    }

    get modifiedAt() {
        return this._modifiedAt;
    }

    get version() {
        return this._version;
    }

    get info() {
        return this._info;
    }

    _fromBaseNameToFullName(baseName, currentName) {
        if (!baseName) {
            return currentName;
        }
        return `${baseName}/${currentName}`;
    }

    _setDecodedObject(obj) {
        this._decodedObject = obj;
    }

    _getRevisionDecodedData() {
        const data = Buffer.from(this._rawData, 'base64');
        return Promise.fromCallback((cb) => gunzip(data, cb))
            .catch(() => {
                return data;
            })
            .then((buffer) => {
                return ReleaseProto.deserializeBinary(new Uint8Array(Buffer.from(buffer)));
            })
            .then((protoObject) => {
                return protoObject.toObject();
            });
    }

    _getNormalizedMetadata(rootDirName) {
        const metadata = _.get(this._decodedObject, 'chart.metadata', {});
        return Promise.resolve({
            name: this._fromBaseNameToFullName(rootDirName, 'Chart.yaml'),
            data: YAML.dump(metadata)
        });
    }

    _getNormalizedTemplates(rootDirName) {
        const templatesList = _.get(this._decodedObject, 'chart.templatesList', []);
        return Promise.map(templatesList, (template) => {
            return {
                name: this._fromBaseNameToFullName(rootDirName, template.name),
                data: Buffer.from(template.data, 'base64').toString(),
            };
        });
    }

    _getNormalizedDependencies(rootDirName) {
        const dependenciesList = _.get(this._decodedObject, 'chart.dependenciesList', []);
        return Promise.map(dependenciesList, (dependency) => {
            const version = 1;
            this;
            const name = _.get(dependency, 'metadata.name');
            const data = {
                NAME: name,
                VERSION: version,
                MODIFIED_AT: this.modifiedAt,
                CREATED_AT: this.createdAt,
                STATUS: this.status,
            }
            const revision = new ReleaseRevision(data);
            revision._setDecodedObject({
                chart: dependency,
            })
            return revision.getChart(`Charts/${name}`);
        });
    }

    _getNormalizedValues(rootDirName) {
        const values = _.get(this._decodedObject, 'chart.values', {});
        return Promise.resolve({
            name: this._fromBaseNameToFullName(rootDirName, 'values'),
            data: values.raw,
        });
    }

    _getNormalizedFiles(rootDirName) {
        const filesList = _.get(this._decodedObject, 'chart.filesList', []);
        return Promise.map(filesList, (file) => {
            return {
                name: this._fromBaseNameToFullName(rootDirName, file.typeUrl),
                data: Buffer.from(file.value, 'base64').toString(),
            };
        });
    }


    getData() {
        return {
            version: this._version,
            createdAt: this._createdAt,
            modifiedAt: this._modifiedAt,
            status: this._status,
            info: this._info,
            name: this._name,
            decodedObject: this._decodedObject,
        };
    }

    init() {
        return this._getRevisionDecodedData()
            .then((decodedObject) => {
                this._setDecodedObject(decodedObject);
                this._createdAt = _.get(decodedObject, 'info.firstDeployed.seconds');
                this._modifiedAt = _.get(decodedObject, 'info.lastDeployed.seconds');
                this._info = _.get(decodedObject, 'info.description');
            });
    }

    getChart(baseName) {
        return Promise.all([
            this._getNormalizedMetadata(baseName),
            this._getNormalizedTemplates(baseName),
            this._getNormalizedDependencies(baseName),
            this._getNormalizedValues(baseName),
            this._getNormalizedFiles(baseName),
        ])
        .then(_.flattenDeep)
        .then(_.compact);
    }

    getManifest() {
        return YAML.safeLoadAll(_.get(this.decodedObject, 'manifest', ''))
            .map(obj => Object.assign({
                data: YAML.dump(obj)
            }));
    }
    getValues() {
        return Object.assign({
            data: _.get(this.decodedObject, 'config.raw', '')
        });
    }
    getHooks() {
        return _.get(this.decodedObject, 'hooksList', []).map(hook => Object.assign({
            name: _.get(hook, 'path', ''),
            data: YAML.dump(_.get(hook, 'manifest', ''))
        }));
    }

}

ReleaseRevision.commonProps = {
    name: 'NAME',
    status: 'STATUS',
    version: 'VERSION',
    modifiedAt: 'MODIFIED_AT',
    createdAt: 'CREATED_AT',
    statusses: {
        deployed: 'DEPLOYED'
    }
};

module.exports = ReleaseRevision;
