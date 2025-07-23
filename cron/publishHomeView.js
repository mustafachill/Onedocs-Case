const axios = require('axios');
require('dotenv').config();

module.exports = async function publishHomeView(userSlackId) {
  const token = process.env.SLACK_BOT_TOKEN;

  const view = {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "📣 Bot aktif durumda! Slash komutlarını kullanabilirsin."
        }
      }
    ]
  };

  try {
    const result = await axios.post(
      'https://slack.com/api/views.publish',
      {
        user_id: userSlackId,
        view: view
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (result.data.ok) {
      console.log('✅ App Home içeriği gösterildi');
    } else {
      console.error('❌ Slack API response error:', result.data);
    }

  } catch (err) {
    if (err.response) {
      console.error('❌ Axios response error:', err.response.data);
    } else {
      console.error('❌ Axios generic error:', err.message);
    }
  }
};
