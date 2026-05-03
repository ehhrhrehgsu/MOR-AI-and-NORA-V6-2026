module.exports = {
  config: { name: 'lock', aliases: ['lockgroup'], description: 'Lock group (only admins can message)', usage: 'lock', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      await api.changeThreadSetting('APPROVAL_MODE', true, threadID);
      api.sendMessage(`🔒 𝗚𝗿𝗼𝘂𝗽 𝗟𝗼𝗰𝗸𝗲𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Group approval mode enabled.\nOnly admins can approve new members.\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed to lock group: ${e.message}`, threadID, messageID); }
  }
};
