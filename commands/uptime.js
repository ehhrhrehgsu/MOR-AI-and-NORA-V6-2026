const moment = require('moment');

module.exports = {
  config: {
    name: 'uptime',
    aliases: ['up'],
    description: 'Check bot uptime',
    usage: 'uptime',
    category: 'Info'
  },
  async run({ api, event, botStartTime }) {
    const { threadID, messageID } = event;
    const diff = Date.now() - (botStartTime || Date.now());
    const duration = moment.duration(diff);
    api.sendMessage(
      `⏱️ NORA AI V10 Uptime:\n` +
      `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`,
      threadID, messageID
    );
  }
};
