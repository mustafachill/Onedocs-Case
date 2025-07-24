const express = require('express');
const router = express.Router();

// API sub-routes
const integrationsRoute = require('./integrations');
const v1Route = require('./v1');

// Mount API routes
router.use('/integrations', integrationsRoute);
router.use('/v1', v1Route);

module.exports = router; 