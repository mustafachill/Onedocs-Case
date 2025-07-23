const Document = require('../../models/Document');

module.exports = async (userId, days = 3) => {
  const now = new Date();
  const upper = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return await Document.find({
    userIds: userId, // ❗ sadece bu kullanıcıya atanmış belgeler
    dueDate: { $gte: now, $lte: upper }
  }).sort({ dueDate: 1 });
};