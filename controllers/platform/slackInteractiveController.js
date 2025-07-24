const axios = require('axios');
const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks');
const Task = require('../../models/Task');
const {
  createTasksBlocks,
  createRemindersBlocks
} = require('../../utils/slackBlocks');

module.exports = async (req, res) => {
  try {
    console.log('🔘 Interactive request received');
    console.log('📦 Request body keys:', Object.keys(req.body));
    console.log('📦 Request body:', req.body);
    
    // Set proper headers for Slack
    res.set('Content-Type', 'application/json');
    
    // Slack interactive payload JSON string olarak gelir
    if (!req.body.payload) {
      console.log('❌ No payload in request body');
      return res.status(200).json({
        text: '❌ No payload found',
        response_type: 'ephemeral'
      });
    }
    
    console.log('📦 Raw payload:', req.body.payload);
    const payload = JSON.parse(req.body.payload);
    console.log('📦 Parsed payload:', payload);
    
    const { user, actions, response_url } = payload;
    
    console.log('👤 User ID:', user?.id);
    console.log('🎯 Actions:', actions?.map(a => a.action_id));
    
    if (!actions || !actions.length) {
      return res.status(200).send('❌ Geçersiz işlem.');
    }

    const action = actions[0];
    const { action_id, value } = action;
    
    // Kullanıcıyı bul
    const slackUser = await getUserByPlatform('slack', user.id);
    if (!slackUser) {
      console.log('❌ Slack user not found:', user.id);
      return res.status(200).json({
        text: '❗ Slack kullanıcısı bulunamadı.',
        response_type: 'ephemeral'
      });
    }
    
    console.log('✅ Slack user found:', slackUser.name);
    console.log('🎯 Processing action:', action_id);

    // Görevi tamamla
    if (action_id.startsWith('complete_task_')) {
      console.log('✅ Complete task action triggered');
      try {
        const taskId = value;
        const { response_url } = payload;
        
        // Görevi tamamla
        await Task.findByIdAndUpdate(taskId, {
          status: 'completed',
          updatedAt: new Date()
        });
        
        if (response_url) {
          console.log('🔗 Sending task completion via response_url');
          await axios.post(response_url, {
            "text": "✅ Görev başarıyla tamamlandı!"
          });
          console.log('✅ Task completion sent successfully!');
        }
        
        return res.status(200).end();
      } catch (error) {
        console.error('❌ Complete task error:', error);
        return res.status(200).end();
      }
    }

    // Görevleri yenile
    if (action_id === 'refresh_tasks') {
      console.log('🔄 Refresh tasks action triggered');
      const { response_url } = payload;
      
      // HIZLI ACKNOWLEDGE - 3 saniye timeout'u önlemek için
      res.status(200).end();
      console.log('✅ Quick acknowledge sent, processing async...');
      
      // ASYNC PROCESSING
      if (response_url) {
        try {
          console.log('🔗 Getting updated tasks async...');
          const tasks = await getAssignedTasks(slackUser._id);
          console.log('🔍 Tasks found for refresh:', tasks.length);
          
          console.log('🔗 Sending updated tasks via response_url');
          const blocksResponse = createTasksBlocks(tasks);
          
          await axios.post(response_url, {
            ...blocksResponse,
            replace_original: true
          });
          console.log('✅ Tasks refreshed successfully!');
        } catch (error) {
          console.error('❌ Async refresh error:', error);
          // Send error message
          await axios.post(response_url, {
            text: '❌ Görevler yenilenirken hata oluştu.',
            replace_original: true
          });
        }
      }
      return; // Already responded
    }

    // Hatırlatmaları göster
    if (action_id === 'show_reminders') {
      console.log('⏰ Show reminders action triggered');
      try {
        const tasks = await getUpcomingTasks(slackUser._id, 3);
        console.log('🔍 Reminders found:', tasks.length);
        
        const { response_url } = payload;
        
        if (response_url) {
          console.log('🔗 Sending reminders via response_url');
          const blocksResponse = createRemindersBlocks(tasks);
          
          await axios.post(response_url, {
            ...blocksResponse,
            replace_original: true
          });
          console.log('✅ Reminders displayed successfully!');
        }
        
        return res.status(200).end();
      } catch (error) {
        console.error('❌ Show reminders error:', error);
        return res.status(200).end();
      }
    }

    // Görevi snooze et
    if (action_id.startsWith('snooze_task_')) {
      console.log('⏰ Snooze task action triggered');
      const taskId = value;
      
      // 1 gün sonraya ertele
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 1);
      
      try {
        await Task.findByIdAndUpdate(taskId, { 
          dueDate: newDueDate,
          updatedAt: new Date()
        });

        return res.status(200).json({
          text: '⏰ Görev 1 gün sonraya ertelendi.',
          response_type: 'ephemeral'
        });
      } catch (error) {
        return res.status(200).json({
          text: '❌ Görev ertelenirken bir hata oluştu.',
          response_type: 'ephemeral'
        });
      }
    }

    // Belge indirme
    if (action_id.startsWith('download_doc_')) {
      console.log('📥 Download document action triggered');
      const documentId = value;
      return res.status(200).json({
        text: `📥 Belge indirme linki: https://onedocs.com/download/${documentId}`,
        response_type: 'ephemeral'
      });
    }

    // Belge onaylama
    if (action_id.startsWith('approve_doc_')) {
      console.log('✅ Approve document action triggered');
      const documentId = value;
      return res.status(200).json({
        text: `✅ Belge ${documentId} onaylandı.`,
        response_type: 'ephemeral'
      });
    }

    // Belge reddetme
    if (action_id.startsWith('reject_doc_')) {
      console.log('❌ Reject document action triggered');
      const documentId = value;
      return res.status(200).json({
        text: `❌ Belge ${documentId} reddedildi.`,
        response_type: 'ephemeral'
      });
    }

    // Yardım menüsünden hızlı görevler
    if (action_id === 'quick_tasks') {
      console.log('📋 Quick tasks action triggered');
      try {
        const tasks = await getAssignedTasks(slackUser._id);
        console.log('🔍 Tasks found:', tasks.length);
        
        const { response_url } = payload;
        
        if (response_url) {
          console.log('🔗 Sending quick tasks via response_url');
          const blocksResponse = createTasksBlocks(tasks);
          
          await axios.post(response_url, {
            ...blocksResponse,
            replace_original: true
          });
          console.log('✅ Quick tasks displayed successfully!');
        }
        
        return res.status(200).end();
      } catch (error) {
        console.error('❌ Quick tasks error:', error);
        return res.status(200).end();
      }
    }

    // Yardım menüsünden hızlı hatırlatmalar
    if (action_id === 'quick_reminders') {
      console.log('⏰ Quick reminders action triggered');
      try {
        const tasks = await getUpcomingTasks(slackUser._id, 3);
        console.log('🔍 Quick reminders found:', tasks.length);
        
        const { response_url } = payload;
        
        if (response_url) {
          console.log('🔗 Sending quick reminders via response_url');
          const blocksResponse = createRemindersBlocks(tasks);
          
          await axios.post(response_url, {
            ...blocksResponse,
            replace_original: true
          });
          console.log('✅ Quick reminders displayed successfully!');
        }
        
        return res.status(200).end();
      } catch (error) {
        console.error('❌ Quick reminders error:', error);
        return res.status(200).end();
      }
    }

    // Bilinmeyen işlem
    console.log('❓ Unknown action:', action_id);
    return res.status(200).json({
      text: '❓ Bilinmeyen işlem.',
      response_type: 'ephemeral'
    });

  } catch (error) {
    console.error('❌ Slack interactive error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(200).json({
      text: '❌ Bir hata oluştu. Lütfen tekrar deneyin.',
      response_type: 'ephemeral'
    });
  }
}; 