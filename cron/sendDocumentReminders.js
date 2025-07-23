const User = require('../models/User');
const getUpcomingDocuments = require('../logic/documents/getUpcomingDocuments');
const sendSlackMessage = require('./sendSlackMessage');
const sendTeamsMessage = require('./sendTeamsMessage'); // İstersen sonra açarız

// 🔹 Ana işlev: her kullanıcıya belge hatırlatması gönder
async function runReminderJob() {
  console.log('📆 Belge hatırlatma job başladı...');

  const users = await User.find();

  for (const user of users) {
    try {
      const documents = await getUpcomingDocuments(user._id, 3);
      if (!documents.length) continue;

      const message = buildReminderMessage(documents);

      if (user.platformIds?.slack) {
        await sendSlackMessage(user.platformIds.slack, message);
      }

      // if (user.platformIds?.teams) {
      //   await sendTeamsMessage(user.platformIds.teams, message);
      // }

      console.log(`✅ Hatırlatma gönderildi → ${user._id}`);
    } catch (err) {
      console.error(`❌ [${user._id}] hatırlatma hatası:`, err.message);
    }
  }

  console.log('✅ Hatırlatma job tamamlandı.');
}

// 🔹 Mesaj yapısı
function buildReminderMessage(documents) {
  return `📌 Yaklaşan belgeler:\n` + documents
    .map(doc => `• *${doc.title}* – ⏰ ${doc.dueDate.toLocaleDateString('tr-TR')}`)
    .join('\n');
}

// 🔹 Cron tanımı (gerçek zamanlı kullanım için)
const cron = require('node-cron');
cron.schedule('0 8 * * *', runReminderJob);

// 🔹 Manuel test için dışa aktar
module.exports = runReminderJob;
