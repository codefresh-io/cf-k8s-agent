const _ = require('lodash');
const rp = require('request-promise');
const newRelicMonitor = require('cf-monitor');
const Promise = require('bluebird');
const zlib = require('zlib');

const logger = require('../logger');
const config = require('../config');
const statistics = require('../statistics');
const storage = require('../storage');


class CodefreshAPI {

    /**
     * Init cluster events in monitor. Should be used when agent starts.
     * Agent will send all resources when watching will start.
     * @param accounts - array of binded accounts
     * @returns {Promise<void>}
     */
    async initEvents(accounts = []) {
        const uri = '/init';
        logger.debug(`Before init events. ${uri}`);
        logger.debug(`Init events. Cluster: ${config.clusterId}. Account: ${config.accountId}`);

        return Promise.all([
            this.getMetadata(),
            this._request({ method: 'POST', uri, body: { accounts } }),
        ])
            .then(([metadata]) => {
                logger.debug(`Metadata -------: ${JSON.stringify(metadata)}`);
                return metadata;
            });
    }

    sendEventsWithLogger(...args) {
        return this.sendEvents(...args).catch((error) => {
            logger.error(error);
            newRelicMonitor.noticeError(error);
        });
    }

    async checkState(callback) {
        const uri = '/state';
        logger.debug(`Checking init events. ${uri}`);
        try {
            const result = await this._request({ uri });

            if (result.needRestart) {
                logger.info(`Agent exits by monitor command`);
                process.exit();
            }

            if (result.needUpdate) {
                callback();
            }
        } catch (error) {
            newRelicMonitor.noticeError(error);
            logger.error(`Error while checking state: ${error.message}`);
        }
    }

    async _sendPackage() {
        const payload = storage.get();
        storage.clear();
        logger.info(`Sending package with ${payload.length} element(s).`);

        const stringifiedPayload = JSON.stringify(payload);
        const optimizedPayload = await Promise.fromCallback(cb => zlib.deflate(stringifiedPayload, cb));

        this._request({ method: 'POST', uri: '', body: { payload: optimizedPayload, gzip: true }  })
            .then((r) => {
                logger.info(`sending result: ${JSON.stringify(r)}`);
                statistics.incPackages();
            }).catch((e) => {
                logger.error(`Cant send because ${e}`);
                newRelicMonitor.noticeError(e);
            });
    }

    async sendPackageWithoutLock(payload) {
        logger.info(`Sending package with ${payload.length} element(s). (without lock)`);

        const stringifiedPayload = JSON.stringify(payload);
        const optimizedPayload = await Promise.fromCallback(cb => zlib.deflate(stringifiedPayload, cb));

        logger.info(`Non gzipped payload size : ${Buffer.from(stringifiedPayload).length}`);
        logger.info(`Gzipped payload size : ${optimizedPayload.length}`);

        this._request({ method: 'POST', uri: '', body: { payload: optimizedPayload, gzip: true } })
            .then((r) => {
                logger.debug(`sending result: ${JSON.stringify(r)}`);
                statistics.incPackages();
            });
    }

    clearInfo(payload) {
        this._request({ method: 'POST', uri: '/clear', body: payload });
    }

    async getMetadata() {
        const uri = '/metadata';
        logger.debug(`Get metadata from ${uri}.`);
        return this._request({ uri });
    }

    async sendStatistics() {
        const uri = '/statistics';
        const body = statistics.result;

        logger.debug(`Sending statistics. ${JSON.stringify(body)}`);
        return this._request({ method: 'POST', uri, body })
            .then(statistics.reset);
    }

    _getIdentifyOptions() {
        if (config.token) {
            return {
                headers: {
                    'authorization': config.token,
                },
                qs: {
                    clusterId: config.clusterId,
                },
            };
        }
        return {
            headers: {},
            qs: {
                accountId: config.accountId,
                clusterId: config.clusterId,
            },
        };
    }

    _request(options) {
        const identify = this._getIdentifyOptions();
        const headers = _.merge(identify.headers, options.headers);
        const qs = _.merge(identify.qs, options.qs);

        const uri = `${config.apiUrl}${options.uri}`;
        const opts = _.merge({ json: true }, options, { headers, qs, uri });
        return rp(opts)
            .catch((e) => {
                logger.error(`Request error: ${e.statusCode} - ${e.message}`);
                newRelicMonitor.noticeError(e);
                return Promise.reject(e);
            });
    }
}

module.exports = new CodefreshAPI();
