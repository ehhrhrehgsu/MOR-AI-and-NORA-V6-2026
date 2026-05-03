const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    aliases: ['ask', 'nora', 'chat'],
    description: 'Ask NORA AI anything',
    usage: 'ai <question>',
    category: 'AI'
  },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(' ').trim();
    if (!question) return api.sendMessage('❓ Please provide a question.\nExample: /ai What is love?', threadID, messageID);
    try {
      api.sendMessage('🤖 NORA AI is thinking...', threadID);
      const res = await axios.get('https://vern-rest-api.vercel.app/api/dapper-tools', {
        params: { prompt: question },
        timeout: 20000
      });
      const raw = res.data?.response || 'Sorry, I could not generate a response.';
      const clean = raw.replace(/\s{2,}/g, ' ').trim();
      api.sendMessage(
        `╔═══════════════════╗\n` +
        `║   🤖  NORA AI V10  ║\n` +
        `╚═══════════════════╝\n\n` +
        `❓ ${question}\n\n` +
        `💬 ${clean}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✨ Powered by Base44`,
        threadID, messageID
      );
    } catch (e) {
      api.sendMessage(
        `╔═══════════════════╗\n` +
        `║   🤖  NORA AI V10  ║\n` +
        `╚═══════════════════╝\n\n` +
        `❌ Failed to get AI response.\n` +
        `Error: ${e.message}`,
        threadID, messageID
      );
    }
  }
};
