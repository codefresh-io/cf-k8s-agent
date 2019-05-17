/* eslint-disable operator-linebreak */

'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Base = require('./resource.base.controller');
const Release = require('./release');
const Revision = require('./revision');

const TILLER_LABEL = 'OWNER=TILLER';

class ReleaseController extends Base {
    static splitDockerDomain(name) {
        const DEFAULT_DOMAIN           = 'docker.io';
        const LEGACY_DEFAULT_DOMAIN    = 'index.docker.io';
        const OFFICIAL_REPOSITORY_NAME = 'library';

        let domain;
        let reminder;

        const indexOfSlash = name.indexOf('/');
        if (indexOfSlash === -1 || !(
            name.lastIndexOf('.', indexOfSlash) !== -1 ||
            name.lastIndexOf(':', indexOfSlash) !== -1 ||
            name.startsWith('localhost/'))) {

            domain   = DEFAULT_DOMAIN;
            reminder = name;
        } else {
            domain   = name.substring(0, indexOfSlash);
            reminder = name.substring(indexOfSlash + 1);
        }

        if (domain === LEGACY_DEFAULT_DOMAIN) {
            domain = DEFAULT_DOMAIN;
        }

        if (domain === DEFAULT_DOMAIN && !reminder.includes('/')) {
            reminder = `${OFFICIAL_REPOSITORY_NAME}/${reminder}`;
        }

        return [domain, reminder];
    }

    static parseFamiliarName(name) {
        function expression(...regexps) {
            return new RegExp(regexps
                .map(re => re.source)
                .join(''));
        }

        function anchored(...regexps) {
            return new RegExp(`^${expression(...regexps).source}$`);
        }

        const identifierRegexp = /[a-f0-9]{64}/;
        const anchoredIdentifierRegexp = anchored(identifierRegexp);

        if (anchoredIdentifierRegexp.test(name)) {
            throw new TypeError(`invalid repository name (${name}),` +
                `cannot specify 64-byte hexadecimal strings`);
        }

        const [domain, remainder] = Base.splitDockerDomain(name);

        let remoteName;
        const tagSeparatorIndex = remainder.indexOf(':');
        if (tagSeparatorIndex > -1) {
            remoteName = remainder.substring(0, tagSeparatorIndex);
        } else {
            remoteName = remainder;
        }

        if (remoteName.toLowerCase() !== remoteName) {
            throw new TypeError(`invalid reference format: repository name must be lowercase`);
        }

        return exports.parseQualifiedName(`${domain}/${remainder}`);
    }


    isRelevantConfigmap(configmap) {
        const labels = _.get(configmap, 'metadata.labels', {});
        return _.toPairs(labels).some(([key, value]) => key === 'OWNER' && value === 'TILLER');
    }

    _readRevisionDataFromConfigmap(configmap) {
        const rawName = _.get(configmap, 'metadata.name', {});
        const labels = _.get(configmap, 'metadata.labels', {});
        const dataAsBase64 = _.get(configmap, 'data.release');
        const revision = new Revision(Object.assign({
            rawName,
            dataAsBase64
        }, labels));
        return revision.init()
            .then(() => {
                return revision;
            });
    }

    prepareRelease(configmap) {
        return this._readRevisionDataFromConfigmap(configmap)
            .then((revision) => {
                return new Release(revision, configmap.metadata.namespace);
            });
    }

    getReleaseByConfigMap(configmap) {
        return Promise.resolve()
            .then(() => {
                return this.isRelevantConfigmap(configmap);
            })
            .then((status) => {
                if (status) {
                    return this.prepareRelease(configmap);
                }

                return null;
            });
    }

    getChartManifestForRevision(release) {
        return release.getRevisionByVersion(release._version).getManifest();
    }

    getChartValuesForRevision(release) {
        return release.getRevisionByVersion(release._version).getValues();
    }

    getChartDescriptorForRevision(release) {
        return release.getRevisionByVersion(release._version).getChart();
    }
}

module.exports = ReleaseController;
