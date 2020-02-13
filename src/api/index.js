const express = require('express');
const statistics = require('../statistics');

const router = express.Router();

router.get('/ping', (req, res) => {
    res.status(200).send();
});

router.get('/info', (req, res) => {
    res.json(statistics.result);
});

module.exports = router;
