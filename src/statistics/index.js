'use strict';

const _ = require('lodash');
const { version } = require('../../package.json');

class Statistics {
    constructor() {
        this.startTime = new Date();
        this.packagesSended = 0;
        this.eventsSended = 0;

        this.incEvents = this.incEvents.bind(this);
        this.incPackages = this.incPackages.bind(this);
        this.incStreamLoses = this.incStreamLoses.bind(this);
        this.reset = this.reset.bind(this);
        this.addError = this.addError.bind(this);

        this.streamLosses = {};
        this.streamErrors = [];
        this.lastStreamRestart = {};
        this.lastUpdateSent = {};
        this.lastUpdateTriggered = {};
        this.entityCounts = {};
    }

    /**
     * Get statistics
     * @return {{startTime: Date, packagesSended: number, eventsSended: number, spec: *}}
     */
    get result() {
        return {
            startTime: this.startTime,
            packagesSended: this.packagesSended,
            eventsSended: this.eventsSended,
            streamLosses: this.streamLosses,
            streamErrors: this.streamErrors,
            lastStreamRestart: this.lastStreamRestart,
            lastUpdateSent: this.lastUpdateSent,
            lastUpdateTriggered: this.lastUpdateTriggered,
            entityCounts: this.entityCounts,
            lastUpdate: _.max(_.values(this.lastUpdateSent)),
            version,
        };
    }

    /**
     * inc packages
     */
    incPackages() {
        this.packagesSended += 1;
    }

    /**
     * inc events
     */
    incEvents() {
        this.eventsSended += 1;
    }

    apply(data) {
        this.lastUpdateTriggered[data.object.kind] = new Date();
        this.entityCounts[data.object.kind] = (this.entityCounts[data.object.kind] || 0) + 1;
    }

    /**
     * inc stream loses by type
     * @param type
     */
    incStreamLoses(type) {
        this.streamLosses[type] = this.streamLosses[type] ? this.streamLosses[type] + 1 : 1;
    }


    /**
     * add errors with type
     * @param err
     * @param type
     * @param resource
     */
    addError(err, type, resource) {
        this.streamErrors.append({
            type,
            err,
            date: new Date(),
            resource,
        });
    }

    reset() {
        this.startTime = new Date();
        this.packagesSended = 0;
        this.eventsSended = 0;
        this.streamLosses = {};
        this.streamErrors = [];
        this.lastStreamRestart = {};
        this.lastUpdateSent = {};
        this.lastUpdateTriggered = {};
        this.entityCounts = {};
    }

}

module.exports = new Statistics();
