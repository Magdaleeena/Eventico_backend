const express = require('express');
const router = express.Router();
const { getEndpoints } = require('../controllers/endpointsController');

router.get('/endpoints', getEndpoints);

module.exports = router;
