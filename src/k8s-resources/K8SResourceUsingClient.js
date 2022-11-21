const _ = require('lodash');
const JSONStream = require('json-stream');
const logger = require('../logger');

/**
 * Class for implementing of cluster resources
 */
const API_K8S_PATH = {
    deployment: 'this.client.appsApi.listDeploymentForAllNamespaces()',
    service: 'this.client.coreApi.listServiceForAllNamespaces()',
    namespace: 'this.client.coreApi.listNamespace()',
    pod: 'this.client.coreApi.listPodForAllNamespaces()',
    secret: 'this.client.coreApi.listSecretForAllNamespaces()',
    configmap: 'this.client.coreApi.listConfigMapForAllNamespaces()'
};

const API_K8S_PATH_WITH_NAMESPACE = {
    deployment: 'this.client.appsApi.listNamespacedDeployment',
    service: 'this.client.coreApi.listNamespacedService',
    pod: 'this.client.coreApi.listNamespacedPod',
    secret: 'this.client.coreApi.listNamespacedSecret',
    configmap: 'this.client.coreApi.listNamespacedConfigMap'
};

class K8SResourceUsingClient {
    constructor(type, path, client, namespace) {
        this.type = type;
        this.entity = _.get(client, path);
        this.path = path;
        this.client = client;
        this.namespace = namespace;
    }

    async get() {
        if (this.namespace) {
            if (this.type === 'namespace') {
                const namespaces = await this.client.coreApi.listNamespace();
                return namespaces;
            }
            const resourcePath = API_K8S_PATH_WITH_NAMESPACE[this.type];
            if (!resourcePath) {
                logger.error(`Unsupported resource path ${this.type}`);
                throw new Error(`Unsupported resource path ${this.type}`);
            }
            const resource = `${resourcePath}(this.namespace)`;
            // eslint-disable-next-line no-eval
            return eval(resource);
        }
        const resource = API_K8S_PATH[this.type];
        if (!resource) {
            logger.error(`Unsupported resource ${this.type}`);
            throw new Error(`Unsupported resource ${this.type}`);
        }
        // eslint-disable-next-line no-eval
        return eval(resource);
    }

    /**
     * Starts new stream for monitoring of resource.
     * @param force - true will cause starting of new stream even if stream of this type already exists
     * @returns { stream|jsonStream }
     */
    startStream(force = false) {
        if (!force && this.stream) {
            logger.info(`Return existing stream of type "${this.type}"`);
            return this;
        }

        logger.info(`Start new stream of type "${this.type}"`);
        this.stream = this.entity.getStream();

        return {
            stream: this.stream,
            jsonStream: this.stream.pipe(new JSONStream()),
        };
    }

    /**
     * Restarts stream
     * @returns {stream|jsonStream}
     */
    restartStream() {
        return this.startStream(true);
    }

}

module.exports = K8SResourceUsingClient;
