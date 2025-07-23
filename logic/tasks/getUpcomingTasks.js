const Task = require('../../models/Task');

module.exports = async (userId, days = 3) => {
  const now = new Date();
  const upper = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return await Task.find({
    userIds: userId,
    status: 'pending',
    dueDate: { $gte: now, $lte: upper }
  }).sort({ dueDate: 1 });
};