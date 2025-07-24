const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks.js');
const getDocumentById = require('../../logic/documents/getDocumentById.js');
const { 
  createTasksBlocks, 
  createRemindersBlocks, 
  createDocumentBlocks, 
  createHelpBlocks 
} = require('../../utils/slackBlocks');

module.exports = async (req, res) => {
  try {
  const { command, user_id, text } = req.body;

    // Set proper headers for Slack
    res.set('Content-Type', 'application/json');

  const user = await getUserByPlatform('slack', user_id);
    if (!user) {
      return res.status(200).send('❗ Slack kullanıcısı bulunamadı.');
    }

  switch (command) {
    case '/gorevlerim': {
      const tasks = await getAssignedTasks(user._id);
        const blocksResponse = createTasksBlocks(tasks);
        return res.status(200).json(blocksResponse);
    }

    case '/hatirlatmalarim': {
      const tasks = await getUpcomingTasks(user._id, 3);
        const blocksResponse = createRemindersBlocks(tasks);
        return res.status(200).json(blocksResponse);
    }

    case '/belge': {
      const id = text?.trim();
        if (!id) {
          return res.status(200).send('❗ Lütfen bir belge ID girin. Örnek: `/belge DOC001`');
        }

      const document = await getDocumentById(id);
        if (!document) {
          return res.status(200).send('❌ Belge bulunamadı. Lütfen geçerli bir belge ID\'si girin.');
        }

        const blocksResponse = createDocumentBlocks(document);
        return res.status(200).json(blocksResponse);
    }

      case '/yardim': {
        const blocksResponse = createHelpBlocks();
        return res.status(200).json(blocksResponse);
      }

    default:
        return res.status(200).send('❌ Geçersiz komut. `/yardim` yazın.');
    }
  } catch (error) {
    console.error('❌ Slack command error:', error);
    return res.status(200).send('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
};
