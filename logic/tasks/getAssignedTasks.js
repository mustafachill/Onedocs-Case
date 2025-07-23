const Task = require('../../models/Task');

module.exports = async (userId) => {
  return await Task.find({
    userId,
    status: 'pending'
  }).sort({ dueDate: 1 });
};