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

// Email notification hook - Task atandığında email gönder
TaskSchema.post('save', async function(task) {
  try {
    // Sadece yeni oluşturulan task'lar için email gönder (createdAt = updatedAt means new)
    const isNewDocument = task.createdAt && task.updatedAt && 
                          Math.abs(task.createdAt.getTime() - task.updatedAt.getTime()) < 1000;
    
    if (isNewDocument && task.userIds && task.userIds.length > 0) {
      const User = require('./User'); // Circular dependency'yi önlemek için burada import
      const { sendTaskAssignmentEmail } = require('../utils/emailService');
      
      // Her kullanıcıya email gönder
      for (const userId of task.userIds) {
        try {
          const user = await User.findById(userId);
          if (user && user.email) {
            await sendTaskAssignmentEmail(user, task);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send task email to user ${userId}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Task post-save hook error:', error);
  }
});

module.exports = mongoose.model('Task', TaskSchema);