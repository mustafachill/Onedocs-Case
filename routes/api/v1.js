const express = require('express');
const router = express.Router();
const webController = require('../../controllers/platform/webController');
const taskController = require('../../controllers/taskController');
const documentController = require('../../controllers/documentController');
const apiKeyAuth = require('../../middlewares/apiKeyAuth');
const { body } = require('express-validator');

// Apply API key authentication to all v1 routes
router.use(apiKeyAuth);

// Chat and internal API endpoints
router.post('/chat', webController.chat);
router.get('/gorevlerim', webController.gorevlerim);
router.get('/hatirlatmalarim', webController.hatirlatmalarim);
router.get('/belge/:id', webController.belge);

// Task Management API
router.post('/tasks', [
  body('title').trim().notEmpty().withMessage('Görev başlığı zorunludur'),
  body('dueDate').isISO8601().withMessage('Geçerli bir tarih giriniz'),
  body('userIds').isArray({ min: 1 }).withMessage('En az bir kullanıcı seçmelisiniz'),
  body('userIds.*').isMongoId().withMessage('Geçersiz kullanıcı ID\'si'),
  body('assignedBy').optional().trim()
], taskController.createTask);

router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/user/:userId', taskController.getUserTasks);

// Document Management API  
router.post('/documents', [
  body('title').trim().notEmpty().withMessage('Belge başlığı zorunludur'),
  body('documentId').trim().notEmpty().withMessage('Belge ID\'si zorunludur'),
  body('documentId').matches(/^[A-Z0-9]+$/).withMessage('Belge ID\'si sadece büyük harf ve rakam içermelidir'),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Geçerli bir tarih giriniz'),
  body('category').optional().isIn(['sozlesme', 'teklif', 'eposta', 'fatura', 'diğer']).withMessage('Geçersiz kategori'),
  body('userIds').isArray({ min: 1 }).withMessage('En az bir kullanıcı seçmelisiniz'),
  body('userIds.*').isMongoId().withMessage('Geçersiz kullanıcı ID\'si'),
  body('fileUrl').optional().isURL().withMessage('Geçerli bir URL giriniz')
], documentController.createDocument);

router.get('/documents', documentController.getAllDocuments);
router.get('/documents/user/:userId', documentController.getUserDocuments);

// Users API (for getting user IDs)
router.get('/users', async (req, res) => {
  try {
    const User = require('../../models/User');
    const users = await User.find({ isActive: true }, 'name email username role').sort({ name: 1 });
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken bir hata oluştu'
    });
  }
});

module.exports = router; 