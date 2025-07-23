const User = require('../../models/User');

/**
 * @param {'slack' | 'teams' | 'web'} platform
 * @param {string} platformId - Slack user_id, Teams AAD id, Web user _id
 * @returns {Promise<User|null>}
 */

module.exports = async (platform, platformId) => {
  switch (platform) {
    case 'slack':
      return await User.findOne({ 'platformIds.slack': platformId });

    case 'teams':
      return await User.findOne({ 'platformIds.teams': platformId });

    case 'web':
      return await User.findById(platformId);

    default:
      throw new Error(`Desteklenmeyen platform türü: ${platform}`);
  }
};
