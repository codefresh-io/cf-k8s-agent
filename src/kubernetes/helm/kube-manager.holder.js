const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');

class KubeManagerHolder {
    constructor() {
        this.kubeManager = null;
    }

    async getInstance(config) {
        if (!this.kubeManager) {
            this.kubeManager = new Promise(async (resolve, reject) => {
                try {
                    const kubeManager = new KubeManager(config);
                    await kubeManager.init();
                    resolve(kubeManager);
                } catch (error) {
                    reject(error);
                }
            })
        }

        return this.kubeManager;
    }
}


module.exports = new KubeManagerHolder();
