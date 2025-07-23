require('dotenv').config(); // .env'den SLACK_BOT_TOKEN yüklenir
const sendSlackMessage = require('./cron/sendSlackMessage');

// TEST: Slack ID'yi buraya yaz
const slackUserId = 'U096RRM6LG3'; // ✅ kendi Slack kullanıcı ID’n (test için)
const message = '🔔 Bu bir test mesajıdır. Sistem çalışıyor!';

sendSlackMessage(slackUserId, message)
  .then(() => {
    console.log('✅ Test mesajı gönderildi.');
  })
  .catch((err) => {
    console.error('❌ Mesaj gönderimi hatası:', err.message);
  });
