const Task = require('../models/Task');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Yeni görev oluştur (Email otomatik gönderilir)
exports.createTask = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { title, dueDate, userIds, assignedBy } = req.body;

    // User'ları kontrol et
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID\'leri bulundu'
      });
    }

    // Task oluştur
    const newTask = new Task({
      title,
      dueDate: new Date(dueDate),
      status: 'pending',
      userIds,
      assignedBy: assignedBy || 'Sistem'
    });

    await newTask.save(); // ← Email otomatik gönderilir (post-save hook)

    res.status(201).json({
      success: true,
      message: `Görev başarıyla oluşturuldu. ${users.length} kullanıcıya email bildirim gönderildi.`,
      task: {
        id: newTask._id,
        title: newTask.title,
        dueDate: newTask.dueDate,
        assignedUsers: users.map(u => ({ id: u._id, name: u.name, email: u.email }))
      }
    });

  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Görev oluşturulurken bir hata oluştu'
    });
  }
};

// Tüm görevleri listele
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('userIds', 'name email username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Görevler alınırken bir hata oluştu'
    });
  }
};

// Belirli bir kullanıcının görevlerini getir
exports.getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tasks = await Task.find({ userIds: userId })
      .populate('userIds', 'name email username')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı görevleri alınırken bir hata oluştu'
    });
  }
}; 