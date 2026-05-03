const axios = require('axios');
const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
module.exports = {
  config: { name: 'horoscope', aliases: ['zodiac', 'star'], description: 'Get daily horoscope for your zodiac sign', usage: 'horoscope <sign>', category: 'Fun', role: 0, cooldown: 10 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const sign = args[0]?.toLowerCase();
    if (!sign || !signs.includes(sign)) return api.sendMessage(
      `⭐ 𝗛𝗼𝗿𝗼𝘀𝗰𝗼𝗽𝗲\n━━━━━━━━━━━━━━━━━━━\n❌ Please enter a valid sign!\n📌 Signs: ${signs.join(', ')}\n💡 Example: /horoscope leo`,
      threadID, messageID
    );
    try {
      const res = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {}, { timeout: 10000 });
      const h = res.data;
      api.sendMessage(
        `⭐ 𝗛𝗼𝗿𝗼𝘀𝗰𝗼𝗽𝗲: ${sign.toUpperCase()}\n━━━━━━━━━━━━━━━━━━━\n📅 Date: ${h.current_date}\n💬 ${h.description}\n🎨 Color: ${h.color}\n🔢 Lucky #: ${h.lucky_number}\n⏰ Best Time: ${h.lucky_time}\n💝 Mood: ${h.mood}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Horoscope unavailable right now. Try again later.`, threadID, messageID); }
  }
};
