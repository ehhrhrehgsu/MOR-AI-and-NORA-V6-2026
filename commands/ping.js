module.exports = {
  config: {
    name: 'ping',
    aliases: ['pong'],
    description: 'Check bot response time',
    usage: 'ping',
    category: 'General'
  },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    const start = Date.now();
    api.sendMessage('🏓 Pong!', threadID, (err) => {
      if (!err) {
        const latency = Date.now() - start;
        api.sendMessage(`⚡ Latency: ${latency}ms\n🤖 NORA AI V10 is online!`, threadID, messageID);
      }
    });
  }
};
