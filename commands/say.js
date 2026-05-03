module.exports = {
  config: { name: 'say', aliases: ['echo'], description: 'Make the bot say something', usage: 'say <message>', category: 'Utility', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ').trim();
    if (!text) return api.sendMessage(`📢 Usage: /say <your message>`, threadID, messageID);
    api.sendMessage(`📢 ${text}`, threadID, messageID);
  }
};
