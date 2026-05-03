module.exports = {
  config: { name: 'unlock', aliases: ['unlockgroup'], description: 'Unlock group approval mode', usage: 'unlock', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      await api.changeThreadSetting('APPROVAL_MODE', false, threadID);
      api.sendMessage(`🔓 𝗚𝗿𝗼𝘂𝗽 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Group is now open for all members.\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed: ${e.message}`, threadID, messageID); }
  }
};
