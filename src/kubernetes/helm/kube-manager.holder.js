const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');

class KubeManagerHolder {
    constructor() {
        this.kubeManager = null;
    }

    async getInstance(config) {
        if (!this.kubeManager) {
            this.kubeManager = new KubeManager(config);
            await this.kubeManager.init();
        }

        return this.kubeManager;
    }
}


module.exports = new KubeManagerHolder();
