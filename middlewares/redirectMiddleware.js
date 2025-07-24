const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Session varsa ve geçerli bir kullanıcıya aitse
    if (req.session.userID) {
      const user = await User.findById(req.session.userID);
      if (user) {
        return res.redirect('/');
      }
    }
    next();
  } catch (error) {
    next();
  }
  };
  