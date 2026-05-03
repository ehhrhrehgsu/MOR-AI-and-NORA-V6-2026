const axios = require('axios');
module.exports = {
  config: { name: 'define', aliases: ['dict', 'meaning'], description: 'Get definition of a word', usage: 'define <word>', category: 'Utility', role: 0, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const word = args[0];
    if (!word) return api.sendMessage(`📖 Usage: /define <word>\nExample: /define serendipity`, threadID, messageID);
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { timeout: 10000 });
      const entry = res.data?.[0];
      const meaning = entry?.meanings?.[0];
      const def = meaning?.definitions?.[0];
      api.sendMessage(
        `📖 𝗗𝗶𝗰𝘁𝗶𝗼𝗻𝗮𝗿𝘆\n━━━━━━━━━━━━━━━━━━━\n🔤 𝗪𝗼𝗿𝗱: ${entry.word}\n📝 𝗣𝗮𝗿𝘁: ${meaning?.partOfSpeech || 'N/A'}\n💬 𝗗𝗲𝗳: ${def?.definition || 'N/A'}\n${def?.example ? `📌 𝗘𝘅: ${def.example}\n` : ''}━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Word "${word}" not found.`, threadID, messageID); }
  }
};
