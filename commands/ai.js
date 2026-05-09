const axios = require('axios');

const DEEPSEEK_KEY = 'sk-9918a6347df242b0874c805fb7d7cbf4';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

module.exports = {
  config: {
    name: 'ai',
    aliases: ['ask', 'nora', 'chat', 'gpt'],
    description: 'اسأل NORA AI (DeepSeek) أي شيء',
    usage: 'ai <السؤال>',
    category: 'AI'
  },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(' ').trim();
    if (!question) return api.sendMessage(
      `🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `❓ يرجى إدخال سؤال!\n` +
      `📌 الاستخدام: /ai <سؤالك>`,
      threadID, messageID
    );
    api.sendMessage(`🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 تفكر...`, threadID);
    try {
      const res = await axios.post(DEEPSEEK_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'أنت NORA AI V10، مساعد ذكاء اصطناعي مفيد وودود مدعوم من Base44. اجعل ردودك مختصرة ومفيدة.' },
          { role: 'user', content: question }
        ],
        max_tokens: 800,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      const reply = res.data?.choices?.[0]?.message?.content?.trim() || 'لم يتم توليد أي رد.';
      api.sendMessage(
        `🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬 ✦ 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `❓ ${question}\n\n` +
        `💬 ${reply}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗕𝗮𝘀𝗲𝟰𝟰 & 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch (e) {
      api.sendMessage(
        `🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `❌ خطأ في الذكاء الاصطناعي: ${e.response?.data?.error?.message || e.message}\n` +
        `💡 يرجى المحاولة مجدداً.`,
        threadID, messageID
      );
    }
  }
};
