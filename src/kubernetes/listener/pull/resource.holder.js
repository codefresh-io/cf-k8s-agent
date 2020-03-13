class ResourceHolder {

    constructor() {
        this.resources = {};
    }

    get() {
        return this.resources;
    }

    set(resources) {
        this.resources = resources;
    }

}

module.exports = new ResourceHolder();
