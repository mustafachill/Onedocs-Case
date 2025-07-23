const express = require('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const User = require('../models/User');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Register route with role and input validation
router.post('/register', [
    body('studentId')
        .trim()
        .notEmpty().withMessage('Öğrenci/Personel numarası zorunludur.')
        .isLength({ min: 9, max: 9 }).withMessage('Öğrenci/Personel numarası 9 haneli olmalıdır.')
        .isNumeric().withMessage('Öğrenci/Personel numarası sadece rakamlardan oluşmalıdır.'),
    body('name')
        .trim()
        .notEmpty().withMessage('Ad Soyad zorunludur.')
        .isLength({ min: 2 }).withMessage('Ad Soyad en az 2 karakter olmalıdır.')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/).withMessage('Ad Soyad sadece harflerden oluşmalıdır.'),
    body('department')
        .trim()
        .notEmpty().withMessage('Bölüm/Fakülte zorunludur.'),
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
        .trim()
        .isIn(['student', 'staff']).withMessage('Geçersiz hesap türü.'),
    roleMiddleware.restrictAdminCreation()
], authController.createUser);

// Login route with input validation
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

// Logout route (requires authentication)
router.post('/logout', authMiddleware.requireAuth, authController.logoutUser);

// Get dashboard (requires authentication)
router.get('/dashboard', authMiddleware.requireAuth, authController.getDashboard);

// Update user info (requires authentication and ownership)
router.put('/users/:userId', [
    authMiddleware.requireAuth,
    roleMiddleware.checkResourceOwnership(),
    body('name')
        .trim()
        .notEmpty().withMessage('Ad Soyad zorunludur.')
        .isLength({ min: 2 }).withMessage('Ad Soyad en az 2 karakter olmalıdır.')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/).withMessage('Ad Soyad sadece harflerden oluşmalıdır.'),
    body('department')
        .trim()
        .notEmpty().withMessage('Bölüm/Fakülte zorunludur.'),
    body('email')
        .trim()
        .notEmpty().withMessage('E-posta zorunludur.')
        .isEmail().withMessage('Geçerli bir e-posta adresi giriniz.')
        .normalizeEmail()
], authController.updateUser);

// Admin only routes
router.get('/users', [
    authMiddleware.requireAuth,
    roleMiddleware.checkRoles(['admin'])
], async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json({
            status: 'success',
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Kullanıcılar listelenirken bir hata oluştu.'
        });
    }
});

module.exports = router;
