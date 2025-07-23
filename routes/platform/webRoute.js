const express = require('express');
const router = express.Router();
const webController = require('../../controllers/platform/webController');

// Chat endpoint for bot conversations
router.post('/chat', webController.chat);

// Web görevlerim sayfası (butonla tetiklenen komut)
router.get('/gorevlerim', webController.gorevlerim);
router.get('/hatirlatmalarim', webController.hatirlatmalarim);
router.get('/belge/:id', webController.belge);

module.exports = router;