const express = require('express');
const router = express.Router();
const slackController = require('../../controllers/platform/slackController');
const slackEventsController = require('../../controllers/platform/slackEventsController');
const slackInteractiveController = require('../../controllers/platform/slackInteractiveController');

// Slack Slash Command endpoint
router.post('/commands', (req, res, next) => {
  console.log('📨 Slack commands endpoint hit');
  next();
}, slackController);

router.post('/events', slackEventsController);

// Slack Interactive Components endpoint (Block Kit button clicks) - TEMP DEBUG
router.post('/interactive', (req, res, next) => {
  console.log('🔘 Slack interactive endpoint hit');
  console.log('📦 Raw body:', req.body);
  console.log('📦 Content-Type:', req.headers['content-type']);
  next();
}, slackInteractiveController);

module.exports = router;