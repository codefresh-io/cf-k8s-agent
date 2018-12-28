'use strict';

const fs = require('fs').promises;
const path = require('path');

async function createResources(client) {
    const resources = {};

    const files = await fs.readdir(path.join(__dirname, 'resources'));
    files.forEach((file) => {
        if (path.extname(file) === '.js') {
            const Res = require(`./resources/${file}`); // eslint-disable-line
            resources[path.basename(file, '.js')] = new Res(client);
        }
    });

    return resources;
}

module.exports = createResources;
