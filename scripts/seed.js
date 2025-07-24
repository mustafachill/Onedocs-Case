const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Document = require('../models/Document');
const Task = require('../models/Task');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost/onedoccase', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('📦 Seed işlemi başlatıldı...');

    // Eski verileri temizle
    await User.deleteMany({});
    await Document.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Eski veriler temizlendi');

    // 1. Test Kullanıcıları Oluştur
    console.log('\n👥 Test kullanıcıları oluşturuluyor...');

    const users = [
      {
        name: 'Mustafa Test',
        username: 'mustafa.test',
        email: 'mustafacilytb@gmail.com',
        password: '123456',
        role: 'admin',
        platformIds: {
          slack: 'U096RRM6LG3', // Gerçek Slack ID'n
          teams: null,
          web: null
        },
      },
      {
        name: 'Ahmet Yılmaz',
        username: 'ahmet.yilmaz',
        email: 'ahmet@test.com',
        password: '123456',
        role: 'manager',
        platformIds: {
          slack: 'U123456789',
          teams: 'ahmet-aad-id',
          web: null
        },
      },
      {
        name: 'Ayşe Demir',
        username: 'ayse.demir',
        email: 'ayse@test.com',
        password: '123456',
        role: 'user',
        platformIds: {
          slack: 'U987654321',
          teams: 'ayse-aad-id',
          web: null
        },
      },
      {
        name: 'Can Özkan',
        username: 'can.ozkan',
        email: 'can@test.com',
        password: '123456',
        role: 'user',
        platformIds: {
          slack: 'U456789123',
          teams: null,
          web: null
        },
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Kullanıcı: ${user.name} (${user.role})`);
    }

    // 2. Test Belgeleri Oluştur
    console.log('\n📄 Test belgeleri oluşturuluyor...');

    const documents = [
      {
        title: 'ABC Şirketi Hizmet Sözleşmesi',
        documentId: 'SOZ001',
        description: 'Yıllık hizmet sözleşmesi, imza ve onay bekliyor',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün sonra
        category: 'sozlesme',
        fileUrl: 'https://example.com/documents/soz001.pdf',
        userIds: [createdUsers[0]._id, createdUsers[1]._id], // Mustafa + Ahmet
        createdBy: createdUsers[1]._id, // Ahmet oluşturdu
      },
      {
        title: 'Yeni Proje Teklifi - E-ticaret Platformu',
        documentId: 'TEK001',
        description: 'XYZ firması için e-ticaret platform geliştirme teklifi',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra
        category: 'teklif',
        fileUrl: 'https://example.com/documents/tek001.pdf',
        userIds: [createdUsers[0]._id, createdUsers[2]._id], // Mustafa + Ayşe
        createdBy: createdUsers[0]._id, // Mustafa oluşturdu
      },
      {
        title: 'Ocak Ayı Hosting Faturası',
        documentId: 'FAT001',
        description: 'DigitalOcean hosting faturası, ödeme zamanı yaklaştı',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 gün sonra (acil!)
        category: 'fatura',
        userIds: [createdUsers[1]._id], // Sadece Ahmet
        createdBy: createdUsers[1]._id,
      },
      {
        title: 'Müşteri Geri Bildirim Raporu',
        documentId: 'RPR001',
        description: 'Q4 müşteri memnuniyet anketi sonuçları',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
        category: 'eposta',
        userIds: [createdUsers[2]._id, createdUsers[3]._id], // Ayşe + Can
        createdBy: createdUsers[2]._id,
      },
      {
        title: 'Veri Güvenliği Politikası',
        documentId: 'POL001',
        description: 'Güncellenmiş GDPR uyumlu veri güvenliği politikası',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 hafta sonra
        category: 'diğer',
        userIds: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id], // Tüm managers
        createdBy: createdUsers[0]._id,
      },
      {
        title: 'GEÇMİŞ BELGE - Aralık Raporu',
        documentId: 'ESK001',
        description: 'Bu belgenin süresi geçmiş (test için)',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
        category: 'diğer',
        userIds: [createdUsers[3]._id], // Can
        createdBy: createdUsers[3]._id,
      }
    ];

    for (const docData of documents) {
      const document = new Document(docData);
      await document.save();
      console.log(`✅ Belge: ${document.title} (${document.documentId})`);
    }

    // 3. Test Görevleri Oluştur
    console.log('\n📝 Test görevleri oluşturuluyor...');

    const tasks = [
      {
        title: 'API dokümantasyonu tamamla',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
        status: 'pending',
        userIds: [createdUsers[0]._id], // Mustafa
        assignedBy: 'Proje Yöneticisi',
      },
      {
        title: 'Slack bot testlerini yap',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 gün sonra (acil!)
        status: 'pending',
        userIds: [createdUsers[1]._id, createdUsers[2]._id], // Ahmet + Ayşe
        assignedBy: 'Test Lead',
      },
      {
        title: 'Veritabanı backup kontrolü',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
        status: 'pending',
        userIds: [createdUsers[1]._id], // Ahmet
        assignedBy: 'DevOps',
      },
      {
        title: 'Email template tasarımı',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 gün sonra
        status: 'pending',
        userIds: [createdUsers[2]._id], // Ayşe
        assignedBy: 'UI/UX Designer',
      },
      {
        title: 'Güvenlik taraması',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 gün sonra
        status: 'pending',
        userIds: [createdUsers[0]._id, createdUsers[1]._id], // Mustafa + Ahmet
        assignedBy: 'Security Team',
      },
      {
        title: 'TAMAMLANMIŞ: Proje planlaması',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
        status: 'completed',
        userIds: [createdUsers[3]._id], // Can
        assignedBy: 'Project Manager',
      },
      {
        title: 'GEÇMİŞ GÖREV: Code review',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 gün önce
        status: 'overdue',
        userIds: [createdUsers[3]._id], // Can
        assignedBy: 'Senior Developer',
      },
      {
        title: 'BUGÜN BİTİR: Slack entegrasyonu test',
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 saat sonra (bugün!)
        status: 'pending',
        userIds: [createdUsers[0]._id], // Mustafa
        assignedBy: 'Bot Developer',
      }
    ];

    for (const taskData of tasks) {
      const task = new Task(taskData);
      await task.save();
      console.log(`✅ Görev: ${task.title} (${task.status})`);
    }

    // 4. Özet bilgiler
    console.log('\n📊 Seed özeti:');
    console.log(`👥 Kullanıcılar: ${createdUsers.length}`);
    console.log(`📄 Belgeler: ${documents.length}`);
    console.log(`📝 Görevler: ${tasks.length}`);

    console.log('\n🎯 Test senaryoları:');
    console.log('• Slack ID ile test: U096RRM6LG3 (Mustafa)');
    console.log('• Yaklaşan görevler: 3 adet (1-4 gün içinde)');
    console.log('• Acil belgeler: 1 adet (1 gün içinde)');
    console.log('• Tamamlanmış görev: 1 adet');
    console.log('• Gecikmiş görev: 1 adet');
    console.log('• Cross-platform kullanıcılar: Slack + Teams ID\'li');

    console.log('\n🧪 Test komutları:');
    console.log('• Web: http://localhost:3000 → "gorevlerim" yaz');
    console.log('• Slack: /gorevlerim komutu');
    console.log('• Email test: npm run test-email');
    console.log('• Health check: node scripts/health-check.js');

    await mongoose.disconnect();
    console.log('\n✅ Seed tamamlandı ve bağlantı kapatıldı.');
    console.log('🚀 Test verileriniz hazır! npm run dev ile başlatabilirsiniz.');

  } catch (err) {
    console.error('❌ Seed hatası:', err.message);
    process.exit(1);
  }
})();
