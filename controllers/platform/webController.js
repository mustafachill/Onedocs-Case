const getUserByPlatform = require('../../logic/user/getUserByPlatform');
const getAssignedTasks = require('../../logic/tasks/getAssignedTasks');
const getUpcomingTasks = require('../../logic/tasks/getUpcomingTasks');
const getTaskById = require('../../logic/documents/getDocumentById');

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
