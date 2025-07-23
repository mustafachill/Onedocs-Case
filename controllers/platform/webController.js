const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks');
const getDocumentById = require('../../logic/documents/getDocumentById');

exports.gorevlerim = async (req, res) => {
  const user = await getUserByPlatform('web', req.session.userID);
  const tasks = await getAssignedTasks(user._id);
  res.render('gorevlerim', { tasks });
};

exports.hatirlatmalarim = async (req, res) => {
  const user = await getUserByPlatform('web', req.session.userID);
  const tasks = await getUpcomingTasks(user._id);
  res.render('hatirlatmalarim', { tasks });
};

exports.belge = async (req, res) => {
  const document = await getDocumentById(req.params.id);
  if (!document) return res.status(404).send('Belge bulunamadı.');
  res.render('belge', { document });
};

// Chat endpoint for bot conversations
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!req.session.userID) {
      return res.json({
        success: false,
        message: '❌ Lütfen önce giriş yapın.'
      });
    }

    const user = await getUserByPlatform('web', req.session.userID);
    if (!user) {
      return res.json({
        success: false,
        message: '❌ Kullanıcı bulunamadı.'
      });
    }

    const trimmedMessage = message.trim();
    const [cmd, ...paramParts] = trimmedMessage.split(' ');
    const param = paramParts.join(' '); // parametreyi orijinal case'de tut

    switch (cmd.toLowerCase()) {
      case 'gorevlerim': {
        const tasks = await getAssignedTasks(user._id);
        if (!tasks.length) {
          return res.json({
            success: true,
            message: '📭 Atanmış göreviniz bulunmuyor.'
          });
        }
        
        const taskList = tasks
          .map(t => `• ${t.title} - ⏰ ${t.dueDate.toLocaleDateString('tr-TR')}`)
          .join('\n');
          
        return res.json({
          success: true,
          message: `📋 Görevleriniz:\n${taskList}`
        });
      }

      case 'hatirlatmalarim': {
        const tasks = await getUpcomingTasks(user._id, 3);
        if (!tasks.length) {
          return res.json({
            success: true,
            message: '📭 Yaklaşan görev bulunmuyor.'
          });
        }
        
        const taskList = tasks
          .map(t => `• ⚠️ ${t.title} - ${t.dueDate.toLocaleDateString('tr-TR')}`)
          .join('\n');
          
        return res.json({
          success: true,
          message: `⏰ Hatırlatmalar (3 gün içinde):\n${taskList}`
        });
      }

      case 'belge': {
        if (!param) {
          return res.json({
            success: true,
            message: '❗ Lütfen belge ID\'sini belirtin. Örnek: belge DOC001'
          });
        }
        
        const document = await getDocumentById(param);
        if (!document) {
          return res.json({
            success: true,
            message: '❌ Belge bulunamadı.'
          });
        }
        
        return res.json({
          success: true,
          message: `📄 ${document.title}\nBelge ID: ${document.documentId}\nKategori: ${document.category || 'Belirtilmemiş'}\nSon Tarih: ${document.dueDate ? document.dueDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}${document.description ? `\nAçıklama: ${document.description}` : ''}`
        });
      }

      case 'yardim': {
        return res.json({
          success: true,
          message: `🤖 Kullanabileceğiniz komutlar:
• gorevlerim - Atanmış görevlerinizi listeler
• hatirlatmalarim - Yaklaşan görevlerinizi gösterir
• belge <ID> - Belge detaylarını getirir (Örnek: belge DOC001)
• yardim - Bu yardım mesajını gösterir`
        });
      }

      default: {
        return res.json({
          success: true,
          message: '❓ Geçersiz komut. Kullanabileceğiniz komutları görmek için "yardim" yazın.'
        });
      }
    }

  } catch (error) {
    console.error('Chat error:', error);
    return res.json({
      success: false,
      message: '❌ Bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
};
