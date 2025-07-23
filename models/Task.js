const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  dueDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },

  // Artık birden fazla kullanıcıya atanabilir
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Bu alan birebir kullanıcı eşleşmesi için kalıyor
  userPlatformMap: {
    slack: { type: String },   // Slack user_id
    teams: { type: String },   // MS Teams AAD ID
    web: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Web kullanıcısı
  },

  assignedBy: {
    type: String,
    default: 'Sistem'
  }

}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);