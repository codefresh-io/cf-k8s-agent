'use strict';

class Statistics {
    constructor() {
        this.startTime = new Date();
        this.packagesSended = 0;
        this.eventsSended = 0;

        this.incEvents = this.incEvents.bind(this);
        this.incPackages = this.incPackages.bind(this);
        this.incStreamLoses = this.incStreamLoses.bind(this);
        this.addError = this.addError.bind(this);

        this.streamLosses = {};
        this.streamErrors = [];
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

}

module.exports = new Statistics();
