const KubeManager = require('@codefresh-io/kube-integration/lib/kube.manager');

class KubeManagerHolder {
    static #kubeManager = null;

    static async getInstance(config) {
        if (!this.#kubeManager) {
            this.#kubeManager = new KubeManager(config);
            await this.#kubeManager.init();
        }

        return this.#kubeManager;
    }
}


module.exports = KubeManagerHolder;
