'use strict';

class PayloadFactory {

    /**
     * Send cluster event to monitor
     * @param payload - data for sending
     * @returns {Promise<void>}
     */
    async sendEvents(payload) {

        let data = _.cloneDeep(payload);

        if (data.kind === 'Status') {
            logger.debug(`Status: ${data.status}. Message: ${data.message}.`);
            return;
        }

        let filteredMetadata = metadataFilter ? metadataFilter.buildResponse(payload.object, payload.object.kind) : payload.object;

        // For release override configmap by release
        if (payload.object.kind.match(/^configmap$/i)) {
            const releaseMetadata = await this.buildReleaseMetadata(payload);
            filteredMetadata = releaseMetadata ? releaseMetadata : filteredMetadata;
        }

        // For service send full data
        if (payload.object.kind.match(/^service$/i)) {
            const serviceMetadata = await this.buildMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = serviceMetadata ? serviceMetadata : filteredMetadata;
        }

        // For pod get images
        if (payload.object.kind.match(/^pod$/i)) {
            const podMetadata = await this.buildMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = podMetadata ? podMetadata : filteredMetadata;
        }

        // For deployment
        if (payload.object.kind.match(/^deployment$/i)) {
            const deploymentMetadata = await this.buildMetadata(payload, config.forceDisableHelmReleases);
            filteredMetadata = deploymentMetadata ? deploymentMetadata : filteredMetadata;
        }


        if (!filteredMetadata) {
            return;
        }

        // Filtered and enriched data
        data = {
            ...data,
            object: filteredMetadata,
        };

        data.counter = counter++;

        logger.debug(`ADD event to package. Cluster: ${config.clusterId}. ${data.object.kind}. ${payload.object.metadata.name}. ${data.type}`);
        logger.debug(`-------------------->: ${JSON.stringify(data.object)} :<-------------------`);

        // TODO: Send each release separately in reason of large size. Should rewrite this code
        if (data.object.kind === 'Release') {
            delete data.object.data;
            logger.info(`Send HELM release - ${data.object.metadata.name} - Payload size: ${JSON.stringify(data).length} - payload ${JSON.stringify(data)}`);
            await this._sendPackage([data]);
        } else {
            storage.push(data);
        }
        statistics.apply(data);
        statistics.incEvents();
        if (storage.size() >= 10) {
            await this._sendPackage();
        }
        else {
            logger.info(`Skip packages sending - size ${storage.size()}`);
        }
    }

    async buildReleaseMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
                kind: 'Release',
            };
        }

        const preparedRelease = await kubernetes.prepareRelease(payload.object);
        if (preparedRelease) {
            const filteredFields = metadataFilter ? metadataFilter.buildResponse(preparedRelease, 'release') : preparedRelease;
            return {
                ...payload.object,
                kind: 'Release',
                release: {
                    ...filteredFields,
                },
            };
        }
        logger.debug(`Skip build release ,  entity ${JSON.stringify(payload)}`);
        return null;
    }

    async buildMetadata(payload) {
        if (payload.type === 'DELETED') {
            return {
                ...payload.object,
            };
        }
        return payload.object;
    }

}

module.exports = new PayloadFactory();
