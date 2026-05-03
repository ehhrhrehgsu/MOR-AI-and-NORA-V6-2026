module.exports = {
  config: { name: 'groupname', aliases: ['rename', 'setname'], description: 'Change group name', usage: 'groupname <new name>', category: 'Admin', role: 1, cooldown: 10 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const name = args.join(' ').trim();
    if (!name) return api.sendMessage(`✏️ Usage: /groupname <new name>`, threadID, messageID);
    try {
      await api.setTitle(name, threadID);
      api.sendMessage(`✏️ 𝗚𝗿𝗼𝘂𝗽 𝗥𝗲𝗻𝗮𝗺𝗲𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Group name changed to:\n"${name}"\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed to rename: ${e.message}`, threadID, messageID); }
  }
};
