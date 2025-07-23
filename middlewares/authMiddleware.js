const User = require('../models/User');

// Zorunlu auth middleware - giriş yapmayan kullanıcıları login'e yönlendirir
exports.requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userID) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.userID);
    if (!user) {
      // Geçersiz session'ı temizle
      req.session.destroy(() => {
        res.redirect('/login');
      });
      return;
    }

    // User'ı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    res.redirect('/login');
  }
};