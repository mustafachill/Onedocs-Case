const express = require('express');
const router = express.Router();
const teamsController = require('../../controllers/platform/teamsController');

// Teams mesaj endpoint
router.post('/messages', teamsController);

module.exports = router;
