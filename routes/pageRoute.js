const express = require('express');
const pageController = require('../controllers/pageController');
const redirectMiddleware = require('../middlewares/redirectMiddleware');

const router = express.Router();

// Auth sayfaları
router.get('/login', redirectMiddleware, pageController.getLoginPage);
router.get('/register', redirectMiddleware, pageController.getRegisterPage);

// Chat sayfaları (opsiyonel auth ile)
router.get('/', pageController.getIndexPage);

module.exports = router;