const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    aliases: ['ask', 'nora'],
    description: 'Ask NORA AI a question',
    usage: 'ai <question>',
    category: 'AI'
  },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(' ');
    if (!question) return api.sendMessage('❓ Please provide a question.', threadID, messageID);
    try {
      api.sendMessage('🤖 NORA AI is thinking...', threadID);
      const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(question)}&lc=en`);
      const reply = res.data?.success || 'Sorry, I could not understand that.';
      api.sendMessage(`🤖 NORA AI:\n${reply}`, threadID, messageID);
    } catch (e) {
      api.sendMessage(`🤖 NORA AI:\nHello! I'm NORA AI V10. You asked: "${question}"\n\n(AI service temporarily unavailable, but I'm here!)`, threadID, messageID);
    }
  }
};
