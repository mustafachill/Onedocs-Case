const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks.js');
const getTaskById = require('../../logic/documents/getDocumentById.js');

module.exports = async (req, res) => {
  const { command, user_id, text } = req.body;

  const user = await getUserByPlatform('slack', user_id);
  if (!user) return res.status(200).send('❗ Slack kullanıcısı bulunamadı.');

  switch (command) {
    case '/gorevlerim': {
      const tasks = await getAssignedTasks(user._id);
      if (!tasks.length) return res.status(200).send('📭 Görev bulunamadı.');
      const list = tasks
        .map(
          (t) => `• *${t.title}* – ⏰ ${t.dueDate.toLocaleDateString('tr-TR')}`
        )
        .join('\n');
      return res.status(200).send(`📋 *Görevleriniz:*\n${list}`);
    }

    case '/hatirlatmalarim': {
      const tasks = await getUpcomingTasks(user._id, 3);
      if (!tasks.length)
        return res.status(200).send('📭 Yaklaşan görev bulunamadı.');
      const list = tasks
        .map(
          (t) => `• ⚠️ *${t.title}* – ${t.dueDate.toLocaleDateString('tr-TR')}`
        )
        .join('\n');
      return res.status(200).send(`⏰ *Hatırlatmalar:*\n${list}`);
    }

    case '/belge': {
      const id = text?.trim();
      if (!id)
        return res
          .status(200)
          .send('❗ Lütfen bir belge ID girin. Örnek: `/belge 64d9...`');

      const document = await getDocumentById(id);
      if (!document) return res.status(200).send('❌ Belge bulunamadı.');

      return res
        .status(200)
        .send(
          `📄 *${document.title}*\nKategori: ${document.category || 'Yok'}\n` +
            `Son Tarih: ${
              document.dueDate
                ? document.dueDate.toLocaleDateString('tr-TR')
                : 'Belirtilmemiş'
            }\n` +
            `${document.description ? `\nNot: ${document.description}` : ''}`
        );
    }

    case '/yardim':
      return res
        .status(200)
        .send(
          `🤖 Kullanılabilir komutlar:\n• /gorevlerim\n• /hatirlatmalarim\n• /belge <id>\n• /yardim`
        );

    default:
      return res.status(200).send('❌ Geçersiz komut.');
  }
};
