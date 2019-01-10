var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.json({index: 'Hello from kubernetes cluster'});
});

module.exports = router;
