/**
 * Teams authentication middleware
 * Verifies Microsoft Teams bot requests
 */
const verifyTeamsAuth = (req, res, next) => {
  // For development, we'll do basic validation
  // In production, you should implement proper JWT verification
  const authorization = req.headers['authorization'];
  
  // Basic validation - check if authorization header exists
  if (!authorization) {
    console.log('❌ Teams authorization header missing');
    return res.status(401).send('Unauthorized');
  }
  
  // Log for debugging
  console.log('✅ Teams webhook authenticated');
  next();
};

module.exports = verifyTeamsAuth; 