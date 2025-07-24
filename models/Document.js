const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },

  dueDate: {
    type: Date // son işlem tarihi vs.
  },

  category: {
    type: String, // örn: sözleşme, teklif, eposta
    enum: ['sozlesme', 'teklif', 'eposta', 'fatura', 'diğer'],
    default: 'diğer'
  },

  fileUrl: {
    type: String // belge dosyasının URL'i (gerekirse)
  },

  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

// Email notification hook - Document atandığında email gönder
DocumentSchema.post('save', async function(document) {
  try {
    // Sadece yeni oluşturulan document'lar için email gönder (createdAt = updatedAt means new)
    const isNewDocument = document.createdAt && document.updatedAt && 
                          Math.abs(document.createdAt.getTime() - document.updatedAt.getTime()) < 1000;
    
    if (isNewDocument && document.userIds && document.userIds.length > 0) {
      const User = require('./User'); // Circular dependency'yi önlemek için burada import
      const { sendDocumentAssignmentEmail } = require('../utils/emailService');
      
      // Her kullanıcıya email gönder
      for (const userId of document.userIds) {
        try {
          const user = await User.findById(userId);
          if (user && user.email) {
            await sendDocumentAssignmentEmail(user, document);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send document email to user ${userId}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Document post-save hook error:', error);
  }
});

module.exports = mongoose.model('Document', DocumentSchema);