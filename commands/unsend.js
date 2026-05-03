module.exports = {
  config: { name: 'unsend', aliases: ['delete', 'del'], description: 'Unsend a replied bot message', usage: 'unsend (reply to bot msg)', category: 'Utility', role: 0, cooldown: 2 },
  async run({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    if (!messageReply) return api.sendMessage(`↩️ Reply to a bot message to unsend it.`, threadID, messageID);
    try {
      await api.unsendMessage(messageReply.messageID);
      api.sendMessage(`🗑️ Message unsent!`, threadID);
    } catch(e) { api.sendMessage(`❌ Cannot unsend: ${e.message}`, threadID, messageID); }
  }
};
