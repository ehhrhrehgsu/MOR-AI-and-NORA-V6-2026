const moment = require('moment');
module.exports = {
  config: { name: 'time', aliases: ['date', 'clock'], description: 'Show current date and time', usage: 'time', category: 'Utility', role: 0, cooldown: 2 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    const now = moment();
    api.sendMessage(
      `🕐 𝗧𝗶𝗺𝗲 & 𝗗𝗮𝘁𝗲\n━━━━━━━━━━━━━━━━━━━\n` +
      `📅 𝗗𝗮𝘁𝗲: ${now.format('MMMM DD, YYYY')}\n` +
      `🕐 𝗧𝗶𝗺𝗲: ${now.format('hh:mm:ss A')}\n` +
      `📆 𝗗𝗮𝘆: ${now.format('dddd')}\n` +
      `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
