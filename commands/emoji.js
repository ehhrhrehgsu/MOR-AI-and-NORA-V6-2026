module.exports = {
  config: { name: 'emoji', aliases: ['setemoji', 'react'], description: 'Set group reaction emoji', usage: 'emoji <emoji>', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const em = args[0];
    if (!em) return api.sendMessage(`😊 Usage: /emoji ❤️`, threadID, messageID);
    try {
      await api.changeThreadEmoji(em, threadID);
      api.sendMessage(`😊 𝗚𝗿𝗼𝘂𝗽 𝗘𝗺𝗼𝗷𝗶\n━━━━━━━━━━━━━━━━━━━\n✅ Emoji set to: ${em}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed: ${e.message}`, threadID, messageID); }
  }
};
