require('dotenv').config();
const mongoose = require('mongoose');
const runReminderJob = require('./cron/sendDocumentReminders');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost/onedoccase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB bağlantısı başarılı.');
    await runReminderJob();
    await mongoose.disconnect();

  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
  }
})();
