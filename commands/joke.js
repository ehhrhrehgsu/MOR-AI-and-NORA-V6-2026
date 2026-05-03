const axios = require('axios');
module.exports = {
  config: { name: 'joke', aliases: ['funny', 'lol'], description: 'Get a random joke', usage: 'joke', category: 'Fun', role: 0, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const res = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 10000 });
      const j = res.data;
      api.sendMessage(
        `😂 𝗥𝗮𝗻𝗱𝗼𝗺 𝗝𝗼𝗸𝗲\n━━━━━━━━━━━━━━━━━━━\n❓ ${j.setup}\n\n😄 ${j.punchline}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) {
      api.sendMessage(`😂 𝗥𝗮𝗻𝗱𝗼𝗺 𝗝𝗼𝗸𝗲\n━━━━━━━━━━━━━━━━━━━\n❓ Why don't scientists trust atoms?\n\n😄 Because they make up everything!\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    }
  }
};
