const express = require('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const User = require('../models/User');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Register route with role and input validation
router.post('/register', [
    body('name')
        .trim()
        .notEmpty().withMessage('Ad Soyad zorunludur.')
        .isLength({ min: 2 }).withMessage('Ad Soyad en az 2 karakter olmalıdır.')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/).withMessage('Ad Soyad sadece harflerden oluşmalıdır.'),
    body('username')
        .trim()
        .notEmpty().withMessage('Kullanıcı adı zorunludur.')
        .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.')
        .custom(async (username) => {
            const user = await User.findOne({ username: username.toLowerCase() });
            if (user) {
                throw new Error('Bu kullanıcı adı zaten kullanımda.');
            }
            return true;
        }),
    body('email')
        .trim()
        .notEmpty().withMessage('E-posta zorunludur.')
        .isEmail().withMessage('Geçerli bir e-posta adresi giriniz.')
        .normalizeEmail()
        .custom(async (email) => {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error('Bu e-posta adresi zaten kullanımda.');
            }
            return true;
        }),
    body('password')
        .trim()
        .notEmpty().withMessage('Şifre zorunludur.')
        .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
    body('role')
        .optional()
        .trim()
        .isIn(['user', 'admin', 'manager']).withMessage('Geçersiz hesap türü.'),
    roleMiddleware.restrictAdminCreation()
], authController.createUser);

// Login route
router.post('/login', [
    body('email')
        .trim()
        .notEmpty().withMessage('E-posta zorunludur.')
        .isEmail().withMessage('Geçerli bir e-posta adresi giriniz.')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty().withMessage('Şifre zorunludur.')
], authController.loginUser);

// Logout route
router.post('/logout', authController.logoutUser);
router.get('/logout', authController.logoutUser);

// Protected routes
router.get('/dashboard', authMiddleware.requireAuth, authController.getDashboard);

// User update route (only for admins or self-update)
router.put('/update/:userId', [
    authMiddleware.requireAuth,
    roleMiddleware.checkResourceOwnership()
], authController.updateUser);

module.exports = router;
