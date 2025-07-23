const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getDocumentById = require('../../logic/documents/getDocumentById');

module.exports = async (req, res) => {
  const { aadObjectId, command } = req.body; // varsayımsal

  const user = await getUserByPlatform('teams', aadObjectId);
  if (!user) return res.status(200).json({ text: 'Kullanıcı bulunamadı.' });

  switch (command) {
    case 'gorevlerim': {
      const tasks = await getAssignedTasks(user._id);
      return res.json({
        type: 'card',
        content: tasks.map(
          (t) => `${t.title} - ${t.dueDate.toLocaleDateString('tr-TR')}`
        ),
      });
    }

    default:
      return res.json({ text: 'Geçersiz komut.' });

    case 'belge': {
      const { documentId } = req.body;
      if (!documentId) return res.json({ text: 'Lütfen bir belge ID girin.' });

      const document = await getDocumentById(documentId);
      if (!document) return res.json({ text: 'Belge bulunamadı.' });

      return res.json({
        type: 'card',
        content: {
          title: document.title,
          description: document.description || 'Açıklama yok.',
          dueDate: document.dueDate
            ? document.dueDate.toLocaleDateString('tr-TR')
            : 'Belirtilmemiş',
        },
      });
    }
  }
};
