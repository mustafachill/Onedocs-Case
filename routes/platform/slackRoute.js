const express = require('express');
const router = express.Router();
const slackController = require('../../controllers/platform/slackController');
const slackEventsController = require('../../controllers/platform/slackEventsController');

// Slack Slash Command endpoint
router.post('/commands', slackController);
router.post('/events', slackEventsController);

module.exports = router;