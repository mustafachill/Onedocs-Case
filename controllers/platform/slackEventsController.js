module.exports = async (req, res) => {
  const { type, event } = req.body;

  // Slack verification için challenge response
  if (type === 'url_verification') {
    return res.status(200).send(req.body.challenge);
  }

  // DM veya app_mention geldiğinde tetiklenir
  if (type === 'event_callback') {
    if (event.type === 'message' && event.channel_type === 'im') {
      console.log('📩 DM geldi:', event.text);
      // Burada istersen geri mesaj da gönderebilirsin
    }

    if (event.type === 'app_mention') {
      console.log('📢 Mention geldi:', event.text);
    }

    return res.sendStatus(200);
  }

  res.sendStatus(200);
};
