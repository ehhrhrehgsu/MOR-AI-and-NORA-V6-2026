const axios = require('axios');
module.exports = {
  config: { name: 'translate', aliases: ['tr', 'lang'], description: 'Translate text to another language', usage: 'translate <lang> <text> | translate en Hello', category: 'Utility', role: 0, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const lang = args[0] || 'en';
    const text = args.slice(1).join(' ').trim();
    if (!text) return api.sendMessage(`🌐 Usage: /translate <lang> <text>\nExample: /translate es Hello World`, threadID, messageID);
    try {
      const res = await axios.get(`https://api.mymemory.translated.net/get`, { params: { q: text, langpair: `auto|${lang}` }, timeout: 12000 });
      const translated = res.data?.responseData?.translatedText || 'Failed to translate.';
      api.sendMessage(
        `🌐 𝗧𝗿𝗮𝗻𝘀𝗹𝗮𝘁𝗲\n━━━━━━━━━━━━━━━━━━━\n📝 𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹: ${text}\n🔄 𝗟𝗮𝗻𝗴: ${lang}\n✅ 𝗥𝗲𝘀𝘂𝗹𝘁: ${translated}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Translation failed: ${e.message}`, threadID, messageID); }
  }
};
