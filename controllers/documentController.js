const Document = require('../models/Document');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Yeni belge oluştur (Email otomatik gönderilir)
exports.createDocument = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { title, documentId, description, dueDate, category, userIds, fileUrl } = req.body;

    // DocumentId uniqueness check
    const existingDoc = await Document.findOne({ documentId });
    if (existingDoc) {
      return res.status(400).json({
        success: false,
        message: 'Bu belge ID\'si zaten kullanımda'
      });
    }

    // User'ları kontrol et
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID\'leri bulundu'
      });
    }

    // Document oluştur
    const newDocument = new Document({
      title,
      documentId,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || 'diğer',
      fileUrl,
      userIds,
      createdBy: req.user ? req.user._id : userIds[0] // Session'dan al yoksa ilk user
    });

    await newDocument.save(); // ← Email otomatik gönderilir (post-save hook)

    res.status(201).json({
      success: true,
      message: `Belge başarıyla oluşturuldu. ${users.length} kullanıcıya email bildirim gönderildi.`,
      document: {
        id: newDocument._id,
        title: newDocument.title,
        documentId: newDocument.documentId,
        category: newDocument.category,
        dueDate: newDocument.dueDate,
        assignedUsers: users.map(u => ({ id: u._id, name: u.name, email: u.email }))
      }
    });

  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Belge oluşturulurken bir hata oluştu'
    });
  }
};

// Tüm belgeleri listele
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('userIds', 'name email username')
      .populate('createdBy', 'name email username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Belgeler alınırken bir hata oluştu'
    });
  }
};

// Belirli bir kullanıcının belgelerini getir
exports.getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const documents = await Document.find({ userIds: userId })
      .populate('userIds', 'name email username')
      .populate('createdBy', 'name email username')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı belgeleri alınırken bir hata oluştu'
    });
  }
}; 