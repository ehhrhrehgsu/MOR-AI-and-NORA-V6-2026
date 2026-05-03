const axios = require('axios');
module.exports = {
  config: { name: 'weather', aliases: ['temp', 'forecast'], description: 'Get weather for a city', usage: 'weather <city>', category: 'Utility', role: 0, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const city = args.join(' ').trim();
    if (!city) return api.sendMessage(`🌤️ Usage: /weather Manila\n📌 Type a city name.`, threadID, messageID);
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 10000 });
      const w = res.data?.current_condition?.[0];
      const area = res.data?.nearest_area?.[0];
      if (!w) throw new Error('No data');
      const desc = w.weatherDesc?.[0]?.value || 'Unknown';
      const areaName = area?.areaName?.[0]?.value || city;
      api.sendMessage(
        `🌤️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿: ${areaName}\n━━━━━━━━━━━━━━━━━━━\n` +
        `🌡️ 𝗧𝗲𝗺𝗽: ${w.temp_C}°C / ${w.temp_F}°F\n` +
        `💨 𝗪𝗶𝗻𝗱: ${w.windspeedKmph} km/h\n` +
        `💧 𝗛𝘂𝗺𝗶𝗱𝗶𝘁𝘆: ${w.humidity}%\n` +
        `☁️ 𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻: ${desc}\n` +
        `👁️ 𝗩𝗶𝘀𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${w.visibility} km\n` +
        `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Weather not found for "${city}". Check the city name.`, threadID, messageID); }
  }
};
