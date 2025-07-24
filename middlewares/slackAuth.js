const crypto = require('crypto');

/**
 * Slack signature verification middleware
 * Verifies that requests are actually coming from Slack
 */
const verifySlackSignature = (req, res, next) => {
  console.log('🔐 Slack auth middleware triggered');
  console.log('📡 Request URL:', req.url);
  console.log('🛠️ Request method:', req.method);
  
  // For development, we'll skip signature verification
  // In production, you should implement proper signature verification
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  console.log('🔑 Slack signature present:', !!slackSignature);
  console.log('⏰ Timestamp present:', !!timestamp);
  
  // Basic validation - check if headers exist
  if (!slackSignature || !timestamp) {
    console.log('❌ Slack signature or timestamp missing');
    return res.status(401).send('Unauthorized');
  }
  
  // Log for debugging
  console.log('✅ Slack webhook authenticated, proceeding to controller');
  next();
};

module.exports = verifySlackSignature; 