const User = require('../models/User');

module.exports = {
    // Belirli rollere sahip kullanıcıları kontrol et
    checkRoles: (roles) => {
        return (req, res, next) => {
            try {
                const userRole = req.session.user?.role;
                
                if (!userRole) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Oturum açmanız gerekiyor.'
                    });
                }

                if (!roles.includes(userRole)) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Bu işlem için yetkiniz bulunmuyor.'
                    });
                }

                next();
            } catch (error) {
                console.error('Role check error:', error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Yetki kontrolü sırasında bir hata oluştu.'
                });
            }
        };
    },

    // Kullanıcının kendi kaynağına erişip erişmediğini kontrol et
    checkResourceOwnership: () => {
        return async (req, res, next) => {
            try {
                const currentUserId = req.session.userID;
                const targetUserId = req.params.userId || req.body.userId;

                // Admin her şeyi yapabilir
                if (req.session.user?.role === 'admin') {
                    return next();
                }

                // Kullanıcı kendi kaynağına erişiyor mu?
                if (currentUserId.toString() !== targetUserId?.toString()) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Başka bir kullanıcının bilgilerine erişemezsiniz.'
                    });
                }

                next();
            } catch (error) {
                console.error('Resource ownership check error:', error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Yetki kontrolü sırasında bir hata oluştu.'
                });
            }
        };
    },

    // Admin oluşturma yetkisi kontrolü
    restrictAdminCreation: () => {
        return async (req, res, next) => {
            try {
                // Eğer role admin olarak ayarlanmaya çalışılıyorsa
                if (req.body.role === 'admin') {
                    // Sadece mevcut bir admin başka bir admin oluşturabilir
                    if (req.session.user?.role !== 'admin') {
                        return res.status(403).json({
                            status: 'error',
                            message: 'Admin hesabı oluşturma yetkiniz yok.'
                        });
                    }
                }
                next();
            } catch (error) {
                console.error('Admin creation check error:', error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Yetki kontrolü sırasında bir hata oluştu.'
                });
            }
        };
    }
};