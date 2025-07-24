/**
 * API Key authentication middleware
 * For internal API endpoints (web chat, documents, tasks)
 */
const verifyApiKey = (req, res, next) => {
  // For web requests with session, allow through
  if (req.session && req.session.userID) {
    console.log('✅ Session-based auth (web user)');
    return next();
  }
  
  // For API requests, check API key
  const apiKey = req.headers['x-api-key'];
  
  // Development: Accept a simple API key
  const validApiKeys = [
    'dev-internal-key-123',
    'web-client-key-456'
  ];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ 
      success: false, 
      message: '❌ Invalid API key' 
    });
  }
  
  console.log('✅ API key authenticated');
  next();
};

module.exports = verifyApiKey; 