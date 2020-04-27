const _ = require('lodash');
const ConfigMapEntity = require('@codefresh-io/kube-integration/lib/kube-native/configMap/configMap');
const KubeManagerHolder = require('./kube-manager.holder');


const { resolveConfig } = require('../client');


class Helm2Factory {
    async create(rawConfigMap) {
        const kubeManager = await KubeManagerHolder.getInstance(resolveConfig());
        const releaseController = kubeManager.getReleaseController('kube-system');

        const configMap = new ConfigMapEntity(rawConfigMap);
        let release;
        const releaseName = _.get(configMap.getLabels(), 'NAME');
        if (releaseName) {
            release = await releaseController.describe(releaseName);
            const orderedHistory = _.orderBy(release._history, 'version');
            release._history = _.takeRight(orderedHistory, 20);
        }
        if (release && +release._version <= +configMap.getLabels().VERSION) {
            const releaseData = release.getFullData();
            const { name, version } = releaseData;
            const chartFiles = await releaseController.getChartDescriptorForRevision(name, version);
            const chartManifest = await releaseController.getChartManifestForRevision(name, version);
            const chartValues = await releaseController.getChartValuesForRevision(name, version);
            return {
                ...releaseData, chartFiles, chartManifest, chartValues
            };
        } else {
            return null;
        }
    }

}

module.exports = new Helm2Factory();
