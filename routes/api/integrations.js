const express = require('express');
const router = express.Router();

// Authentication middlewares
const slackAuth = require('../../middlewares/slackAuth');
const teamsAuth = require('../../middlewares/teamsAuth');

// Platform integrations
const slackRoute = require('../platform/slackRoute');
const teamsRoute = require('../platform/teamsRoute');

// Integration routes with authentication - TEMP: Slack auth bypassed for debug
router.use('/slack', (req, res, next) => {
  console.log('🔍 TEMP: Bypassing Slack auth for debug');
  console.log('🔍 Request URL:', req.url);
  console.log('🔍 Request method:', req.method);
  next();
}, slackRoute);
router.use('/teams', teamsAuth, teamsRoute);

module.exports = router; 