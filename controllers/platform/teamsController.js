const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks.js');
const getDocumentById = require('../../logic/documents/getDocumentById');
const { BotFrameworkAdapter } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

module.exports = (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    if (context.activity.type !== 'message') return;

    const aadObjectId =
      context.activity.from?.aadObjectId || context.activity.from?.id;
    const text = context.activity.text?.trim() || '';
    const [command, param] = text.split(' ');

    const user = await getUserByPlatform('teams', aadObjectId);
    if (!user) return await context.sendActivity('❌ Kullanıcı bulunamadı.');

    switch (command.toLowerCase()) {
      case 'gorevlerim': {
        const tasks = await getAssignedTasks(user._id);
        if (!tasks.length)
          return await context.sendActivity('✅ Atanmış göreviniz yok.');

        const msg = tasks
          .map(
            (t) => `📌 ${t.title} – ${t.dueDate.toLocaleDateString('tr-TR')}`
          )
          .join('\n');
        return await context.sendActivity(msg);
      }
      case 'hatirlatmalarim': {
        const tasks = await getUpcomingTasks(user._id, 3);
        if (!tasks.length)
          return await context.sendActivity('📭 Yaklaşan görev bulunamadı.');

        const list = tasks
          .map(
            (t) => `• ⚠️ ${t.title} – ${t.dueDate.toLocaleDateString('tr-TR')}`
          )
          .join('\n');

        return await context.sendActivity(`⏰ *Hatırlatmalar:*\n${list}`);
      }
      case 'belge': {
        if (!param)
          return await context.sendActivity('⚠️ Lütfen belge ID girin.');
        const document = await getDocumentById(param);
        if (!document)
          return await context.sendActivity('❌ Belge bulunamadı.');

        return await context.sendActivity(
          `📄 ${
            document.title
          }\n🗓️ Son Tarih: ${document.dueDate.toLocaleDateString('tr-TR')}`
        );
      }
      case 'yardim': {
        return await context.sendActivity(
          `🤖 Kullanılabilir komutlar:\n` +
            `• gorevlerim\n` +
            `• hatirlatmalarim\n` +
            `• belge <id>\n` +
            `• yardim`
        );
      }
      default:
        return await context.sendActivity(
          '❓ Geçersiz komut. Kullanabileceğiniz komutları görmek için `yardim` yazın.'
        );
    }
  });
};
