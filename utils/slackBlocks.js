// Slack Block Kit Helper Functions
// Bu dosya Slack mesajlarını zengin UI componentlerine çevirir

/**
 * Görevler listesi için zengin block layout
 * @param {Array} tasks - Görev listesi
 * @returns {Object} Slack blocks JSON
 */
exports.createTasksBlocks = (tasks) => {
  if (!tasks.length) {
    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':inbox_tray: *Görevleriniz*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':zzz: Henüz görev bulunmuyor. Rahat bir gününüz geçsin!'
          }
        }
      ]
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 Görevleriniz'
      }
    },
    {
      type: 'divider'
    }
  ];

  // Her görev için ayrı kart oluştur
  tasks.forEach((task, index) => {
    const dueDate = task.dueDate ? task.dueDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş';
    const isOverdue = task.dueDate && task.dueDate < new Date();
    const statusEmoji = isOverdue ? '🔴' : '🟡';
    
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${statusEmoji} *${task.title}*\n📅 *Son Tarih:* ${dueDate}\n⏳ *Durum:* ${task.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}`
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '✅ Tamamla'
        },
        style: 'primary',
        action_id: `complete_task_${task._id}`,
        value: task._id.toString()
      }
    });

    // Son görev değilse divider ekle
    if (index < tasks.length - 1) {
      blocks.push({ type: 'divider' });
    }
  });

  // Alt kısma genel işlem butonları ekle
  blocks.push(
    {
      type: 'divider'
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔄 Yenile'
          },
          action_id: 'refresh_tasks',
          value: 'refresh'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '⏰ Hatırlatmalar'
          },
          action_id: 'show_reminders',
          value: 'reminders'
        }
      ]
    }
  );

  return { blocks };
};

/**
 * Hatırlatmalar için zengin block layout
 * @param {Array} tasks - Yaklaşan görevler listesi
 * @returns {Object} Slack blocks JSON
 */
exports.createRemindersBlocks = (tasks) => {
  if (!tasks.length) {
    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':alarm_clock: *Hatırlatmalar*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':white_check_mark: Yaklaşan görev bulunmuyor. Her şey yolunda!'
          }
        }
      ]
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⏰ Hatırlatmalar'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Önümüzdeki 3 gün içinde son tarihi dolacak görevler:'
        }
      ]
    },
    {
      type: 'divider'
    }
  ];

  // Her hatırlatma için kart oluştur
  tasks.forEach((task, index) => {
    const dueDate = task.dueDate.toLocaleDateString('tr-TR');
    const daysLeft = Math.ceil((task.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    
    let urgencyEmoji = '🟡';
    let urgencyText = 'Normal';
    
    if (daysLeft <= 1) {
      urgencyEmoji = '🔴';
      urgencyText = 'Acil';
    } else if (daysLeft <= 2) {
      urgencyEmoji = '🟠';
      urgencyText = 'Yakın';
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${urgencyEmoji} *${task.title}*\n📅 *Son Tarih:* ${dueDate}\n❗ *Aciliyet:* ${urgencyText}\n⏰ *Kalan Süre:* ${daysLeft} gün`
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '⏰ Snooze'
        },
        action_id: `snooze_task_${task._id}`,
        value: task._id.toString()
      }
    });

    if (index < tasks.length - 1) {
      blocks.push({ type: 'divider' });
    }
  });

  return { blocks };
};

/**
 * Belge detayı için zengin block layout
 * @param {Object} document - Belge objesi
 * @returns {Object} Slack blocks JSON
 */
exports.createDocumentBlocks = (document) => {
  const dueDate = document.dueDate ? document.dueDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş';
  const categoryMap = {
    'sozlesme': ':page_with_curl: Sözleşme',
    'teklif': ':memo: Teklif',
    'eposta': ':email: E-posta',
    'fatura': ':receipt: Fatura',
    'diğer': ':file_folder: Diğer'
  };
  
  const categoryDisplay = categoryMap[document.category] || ':file_folder: Diğer';
  
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📄 ${document.title}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Belge ID:*\n${document.documentId}`
        },
        {
          type: 'mrkdwn',
          text: `*Kategori:*\n${categoryDisplay}`
        },
        {
          type: 'mrkdwn',
          text: `*Son Tarih:*\n📅 ${dueDate}`
        },
        {
          type: 'mrkdwn',
          text: `*Durum:*\n⏳ Bekliyor`
        }
      ]
    }
  ];

  // Açıklama varsa ekle
  if (document.description) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Açıklama:*\n${document.description}`
      }
    });
  }

  // İşlem butonları
  blocks.push(
    {
      type: 'divider'
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📥 İndir'
          },
          style: 'primary',
          action_id: `download_doc_${document.documentId}`,
          value: document.documentId
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✅ Onayla'
          },
          style: 'primary',
          action_id: `approve_doc_${document.documentId}`,
          value: document.documentId
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '❌ Reddet'
          },
          style: 'danger',
          action_id: `reject_doc_${document.documentId}`,
          value: document.documentId
        }
      ]
    }
  );

  return { blocks };
};

/**
 * Yardım menüsü için zengin block layout
 * @returns {Object} Slack blocks JSON
 */
exports.createHelpBlocks = () => {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 OneDocs Slack Bot'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Merhaba! Ben OneDocs asistanınızım. Size nasıl yardımcı olabilirim?'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Kullanılabilir Komutlar:*'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*📋 `/gorevlerim`*\nSize atanan tüm görevleri listeler'
          },
          {
            type: 'mrkdwn',
            text: '*⏰ `/hatirlatmalarim`*\nYaklaşan son tarihli görevler'
          },
          {
            type: 'mrkdwn',
            text: '*📄 `/belge [ID]`*\nBelge detaylarını gösterir'
          },
          {
            type: 'mrkdwn',
            text: '*🆘 `/yardim`*\nBu yardım menüsünü gösterir'
          }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📋 Görevlerim'
            },
            style: 'primary',
            action_id: 'quick_tasks',
            value: 'tasks'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '⏰ Hatırlatmalar'
            },
            action_id: 'quick_reminders',
            value: 'reminders'
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: ':information_source: OneDocs v1.0 - Tüm hakları saklıdır'
          }
        ]
      }
    ]
  };
}; 