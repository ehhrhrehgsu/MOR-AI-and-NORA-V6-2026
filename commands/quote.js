const axios = require('axios');
module.exports = {
  config: { name: 'quote', aliases: ['inspire', 'motivation'], description: 'Get a random inspirational quote', usage: 'quote', category: 'Fun', role: 0, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const res = await axios.get('https://api.quotable.io/random', { timeout: 10000 });
      const q = res.data;
      api.sendMessage(
        `💭 𝗜𝗻𝘀𝗽𝗶𝗿𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗤𝘂𝗼𝘁𝗲\n━━━━━━━━━━━━━━━━━━━\n"${q.content}"\n\n— 𝗔𝘂𝘁𝗵𝗼𝗿: ${q.author}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) {
      const quotes = [
        { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      api.sendMessage(`💭 𝗤𝘂𝗼𝘁𝗲\n━━━━━━━━━━━━━━━━━━━\n"${q.content}"\n\n— ${q.author}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    }
  }
};
