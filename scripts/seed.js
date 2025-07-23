const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Document = require('../models/Document');
const Task = require('../models/Task'); // Eğer tanımlıysa

(async () => {
  try {
    await mongoose.connect('mongodb://localhost/onedoccase', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('📦 Seed işlemi başlatıldı...');

    // Eski verileri temizle (opsiyonel)
    await User.deleteMany({});
    await Document.deleteMany({});
    await Task.deleteMany({});

    // 1. Kullanıcı oluştur
    const newUser = new User({
      name: 'Test Kullanıcısı',
      username: 'testuser',
      email: 'testuser@onedocs.com',
      password: '123456', // bcrypt ile hashlenecek (modelde otomatik)
      platformIds: {
        slack: 'U096RRM6LG3', // kendi Slack ID'in
        teams: null,
        web: null
      },
    });

    await newUser.save();
    console.log('✅ Kullanıcı oluşturuldu:', newUser.username);

    // 2. Test Belgesi oluştur
    const newDocument = new Document({
      title: 'Test Sözleşmesi',
      documentId: 'DOC001',
      description: 'Bu bir test sözleşme belgesidir.',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün sonra
      category: 'sozlesme',
      fileUrl: '',
      userIds: [newUser._id],
      createdBy: newUser._id,
    });

    await newDocument.save();
    console.log(`📄 Belge eklendi: ${newDocument.title} (ID: ${newDocument.documentId})`);

    // 3. İkinci test belgesi
    const newDocument2 = new Document({
      title: 'Proje Teklifi',
      documentId: 'DOC002',
      description: 'Yeni proje için hazırlanan teklif belgesi.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra
      category: 'teklif',
      fileUrl: '',
      userIds: [newUser._id],
      createdBy: newUser._id,
    });

    await newDocument2.save();
    console.log(`📄 Belge eklendi: ${newDocument2.title} (ID: ${newDocument2.documentId})`);

    // 4. Üçüncü test belgesi
    const newDocument3 = new Document({
      title: 'Aylık Fatura',
      documentId: 'DOC003',
      description: 'Ocak ayı fatura belgesi.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      category: 'fatura',
      fileUrl: '',
      userIds: [newUser._id],
      createdBy: newUser._id,
    });

    await newDocument3.save();
    console.log(`📄 Belge eklendi: ${newDocument3.title} (ID: ${newDocument3.documentId})`);

    // 5. Görev oluştur (isteğe bağlı)
    const newTask = new Task({
      title: 'Test Görevi',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      userIds: [newUser._id], // Array olarak güncellendi
      userPlatformMap: {
        slack: newUser.platformIds.slack,
        teams: null,
        web: newUser._id,
      },
      assignedBy: 'Sistem',
    });

    await newTask.save();
    console.log('📝 Görev eklendi:', newTask.title);

    await mongoose.disconnect();
    console.log('✅ Seed tamamlandı ve bağlantı kapatıldı.');

  } catch (err) {
    console.error('❌ Seed hatası:', err.message);
  }
})();
