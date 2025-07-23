const Task = require('../../models/Task');

module.exports = async (userId) => {
  return await Task.find({
    userIds: userId,
    status: 'pending'
  }).sort({ dueDate: 1 });
};