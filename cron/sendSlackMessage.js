const axios = require('axios');
require('dotenv').config();

module.exports = async (userSlackId, message) => {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.error('❌ SLACK_BOT_TOKEN eksik.');
    return;
  }

  try {
    // 1. Adım: Kullanıcıyla aramızda DM kanalı aç
    const openChannelRes = await axios.post(
      'https://slack.com/api/conversations.open',
      {
        users: userSlackId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!openChannelRes.data.ok) {
      console.error('❌ Kanal açma hatası:', openChannelRes.data.error);
      return;
    }

    const channelId = openChannelRes.data.channel.id;

    // 2. Adım: Kanala mesaj gönder
    const sendMessageRes = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: channelId,
        text: message
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!sendMessageRes.data.ok) {
      console.error('❌ Mesaj gönderme hatası:', sendMessageRes.data.error);
    } else {
      console.log(`📤 [SLACK] Mesaj gönderildi → ${userSlackId} (${channelId})`);
    }

  } catch (err) {
    if (err.response) {
      console.error('❌ Slack API response hatası:', err.response.data);
    } else {
      console.error('❌ Slack hata:', err.message);
    }
  }
};
