const _ = require('lodash');
const SecretEntity = require('@codefresh-io/kube-integration/lib/kube-native/secret/secret');
const KubeManagerHolder = require('./kube-manager.holder');

const { resolveConfig } = require('../client');
const logger = require('../../logger');


class Helm3Factory {
    async create(rawSecret) {
        const kubeManager = await KubeManagerHolder.getInstance(resolveConfig());
        let releaseController;
        const namespace = _.get(rawSecret, 'metadata.namespace');
        const secret = new SecretEntity(rawSecret);
        let release;
        const releaseName = _.get(secret.getLabels(), 'name');
        if (releaseName) {
            releaseController = kubeManager.getReleaseHelm3Controller(namespace);
            release = await releaseController.describe(releaseName);
        }
        if (!release) {
            if (releaseName) {
                logger.info(`Wasnt able describe release, name ${_.get(rawSecret, 'metadata.name')} in namespace  ${namespace}`);
            }

            // if not found release in namespace
            return null;
        }
        const orderedHistory = _.orderBy(release._history, 'version');
        release._history = _.takeRight(orderedHistory, 20);
        if (+release._version <= +secret.getLabels().version) {
            const releaseData = release.getFullData();
            const { name, version } = releaseData;
            const chartFiles = await releaseController.getChartDescriptorForRevision(name, version);
            const chartManifest = await releaseController.getChartManifestForRevision(name, version);
            const chartValues = await releaseController.getChartValuesForRevision(name, version);
            return {
                ...releaseData, chartFiles, chartManifest, chartValues
            };
        }
        return null;

    }

}

module.exports = new Helm3Factory();
