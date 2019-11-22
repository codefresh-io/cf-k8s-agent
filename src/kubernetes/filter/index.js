'use strict';

class Filter {

    filter(kind, items) {
        console.log(JSON.stringify(items));
    }

}

module.exports = new Filter();
