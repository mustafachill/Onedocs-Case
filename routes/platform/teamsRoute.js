const express = require('express');
const router = express.Router();
const teamsController = require('../../controllers/platform/teamsController');

// Teams bot endpoint (örnek: webhook)
router.post('/commands', teamsController);

module.exports = router;
