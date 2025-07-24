const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
        // Validate and sanitize input
        const userData = {
            name: req.body.name?.trim(),
      username: req.body.username?.trim(),
            email: req.body.email?.trim().toLowerCase(),
            password: req.body.password,
      role: req.body.role || 'user' // Default to user if not provided
        };

        // Input validation
    if (!userData.name || !userData.username || !userData.email || !userData.password) {
            req.flash('error', 'Tüm alanları doldurunuz.');
            return res.status(400).redirect('/register');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            req.flash('error', 'Geçerli bir e-posta adresi giriniz.');
            return res.status(400).redirect('/register');
        }

    // Username validation (minimum 3 characters, alphanumeric)
    if (userData.username.length < 3) {
      req.flash('error', 'Kullanıcı adı en az 3 karakter olmalıdır.');
      return res.status(400).redirect('/register');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      req.flash('error', 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.');
            return res.status(400).redirect('/register');
        }

        // Password strength validation
        if (userData.password.length < 6) {
            req.flash('error', 'Şifre en az 6 karakter olmalıdır.');
            return res.status(400).redirect('/register');
        }

        // Role validation
    const allowedRoles = ['user', 'admin', 'manager'];
        if (!allowedRoles.includes(userData.role)) {
            req.flash('error', 'Geçersiz hesap türü.');
            return res.status(400).redirect('/register');
        }

        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                { email: userData.email },
        { username: userData.username }
            ]
        });

        if (existingUser) {
            req.flash('error', existingUser.email === userData.email ? 
                'Bu e-posta adresi zaten kullanımda.' : 
        'Bu kullanıcı adı zaten kullanımda.');
            return res.status(400).redirect('/register');
        }

        // Create user with validated data
        const user = await User.create(userData);
        
        req.flash('success', 'Kayıt başarılı! Giriş yapabilirsiniz.');
        res.status(201).redirect('/login');
  } catch (error) {
        console.error('Kayıt hatası:', error);
        req.flash('error', 'Kayıt sırasında bir hata oluştu.');
        res.status(500).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
        const { email, password } = req.body;

        // Email ve şifre kontrolü
        if (!email || !password) {
            req.flash('error', 'Lütfen e-posta ve şifrenizi giriniz.');
            return res.status(400).redirect('/login');
    }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error', 'Geçerli bir e-posta adresi giriniz.');
            return res.status(400).redirect('/login');
    }

        // Kullanıcıyı bul ve tüm alanları seç
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
            req.flash('error', 'Böyle bir kullanıcı bulunamadı.');
            return res.status(400).redirect('/login');
    }

    // Kullanıcı aktif mi kontrolü
    if (!user.isActive) {
      req.flash('error', 'Hesabınız devre dışı bırakılmış.');
      return res.status(400).redirect('/login');
    }

    // Şifre doğrulama
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
            req.flash('error', 'Şifreniz yanlış.');
            return res.status(400).redirect('/login');
    }

    // Son giriş tarihini güncelle
    user.lastLoginAt = new Date();
    await user.save();

        // Session'a kullanıcı bilgilerini kaydet
    req.session.userID = user._id;
        req.session.user = {
            _id: user._id,
            name: user.name,
      username: user.username,
            email: user.email,
            role: user.role
        };

        // Session güvenlik ayarları
        req.session.cookie.secure = process.env.NODE_ENV === 'production'; // HTTPS only in production
        req.session.cookie.httpOnly = true; // Prevent XSS
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 saat
        req.session.cookie.sameSite = 'strict'; // CSRF protection

        // Session'ı kaydet ve yönlendir
        req.session.save((err) => {
            if (err) {
                console.error('Session kaydetme hatası:', err);
                req.flash('error', 'Giriş yapılırken bir hata oluştu.');
                return res.status(500).redirect('/login');
            }
            
            req.flash('success', 'Giriş başarılı!');
            res.redirect('/');
        });
  } catch (error) {
        console.error('Giriş hatası:', error);
        req.flash('error', 'Giriş yapılırken bir hata oluştu.');
        res.status(500).redirect('/login');
  }
};

exports.logoutUser = async (req, res) => {
    try {
        if (req.session) {
            // Session'ı temizle
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Çıkış yapılırken bir hata oluştu.'
                    });
                }
                
                // Clear the cookie
                res.clearCookie('connect.sid');
                res.redirect('/login');
  });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Çıkış yapılırken bir hata oluştu.'
        });
    }
};

exports.getDashboard = async (req, res) => {
  try {
        // Session kontrolü
        if (!req.session.userID) {
            return res.status(401).redirect('/login');
        }

        const user = await User.findById(req.session.userID);
        
        if (!user) {
            req.session.destroy();
            return res.status(404).redirect('/login');
        }

        res.status(200).render('dashboard', {
            user,
            page_name: 'dashboard'
        });
  } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Bir hata oluştu.'
    });
  }
};

// Kullanıcı bilgilerini güncelleme
exports.updateUser = async (req, res) => {
  try {
        const userId = req.params.userId;
        
        // Sadece belirli alanların güncellenmesine izin ver
        const updateData = {
            name: req.body.name?.trim(),
      username: req.body.username?.trim(),
            email: req.body.email?.trim().toLowerCase()
        };

        // Input validation
    if (!updateData.name || !updateData.username || !updateData.email) {
            return res.status(400).json({
                status: 'error',
                message: 'Tüm alanları doldurunuz.'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Geçerli bir e-posta adresi giriniz.'
            });
        }

    // Check if email or username exists for another user
        const existingUser = await User.findOne({
      $or: [
        { email: updateData.email },
        { username: updateData.username }
      ],
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
        message: existingUser.email === updateData.email ? 
          'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.' :
          'Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

    if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Kullanıcı bulunamadı.'
            });
    }

        res.status(200).json({
            status: 'success',
            message: 'Kullanıcı bilgileri güncellendi.',
            data: {
                user: {
                    name: user.name,
          username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Kullanıcı güncellenirken bir hata oluştu.'
        });
    }
};