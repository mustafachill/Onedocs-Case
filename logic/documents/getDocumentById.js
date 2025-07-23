const Document = require('../../models/Document');

module.exports = async (documentId) => {
  return await Document.findOne({ documentId });
};