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

module.exports = mongoose.model('Document', DocumentSchema);