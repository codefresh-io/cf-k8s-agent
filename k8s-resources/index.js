'use strict';

const fs = require('fs');
const path = require('path');

class K8SResource {
    constructor(resType) {
        this.resType = resType;
    }

    getStream() {}
}

exports.base = K8SResource;
exports.resources = {};

fs.readdirSync(__dirname).forEach((file) => {
    if (file !== 'index.js' && path.extname(file) === '.js') {
        const Res = require(`./${file}`); // eslint-disable-line
        exports.resources[path.basename(file, '.js')] = new Res();
    }
});
