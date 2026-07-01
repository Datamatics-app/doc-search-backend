// dashboard-meta.routes.js

const express = require('express');
const router = express.Router();

const masterDataController = require('./master-data.controller');

router.get('/meta-data', masterDataController.getDashboardMetaData.bind(masterDataController));

module.exports = router;