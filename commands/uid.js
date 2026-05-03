module.exports = {
  config: {
    name: 'uid',
    aliases: ['id'],
    description: 'Get your Facebook UID',
    usage: 'uid',
    category: 'Info'
  },
  async run({ api, event }) {
    const { threadID, messageID, senderID } = event;
    api.sendMessage(`🆔 Your Facebook UID:\n${senderID}`, threadID, messageID);
  }
};
