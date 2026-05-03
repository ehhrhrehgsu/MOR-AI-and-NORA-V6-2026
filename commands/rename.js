module.exports = {
  config: {
    name: 'rename',
    aliases: ['setname', 'groupname', 'changename'],
    description: 'Rename the group chat',
    usage: 'rename <new name>',
    category: 'Admin',
    role: 1
  },
  async onStart({ api, event, args }) {
    const { threadID, messageID } = event;
    const name = args.join(' ').trim();
    if (!name) return api.sendMessage(`✏️ 𝗥𝗘𝗡𝗔𝗠𝗘\n━━━━━━━━━━━━━━━━━━━\n❌ Please provide a name.\n📌 Usage: /rename My Group`, threadID, messageID);
    try {
      await api.setTitle(name, threadID);
      api.sendMessage(`✏️ 𝗥𝗘𝗡𝗔𝗠𝗘\n━━━━━━━━━━━━━━━━━━━\n✅ Group renamed to: "${name}"\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) {
      api.sendMessage(`✏️ 𝗥𝗘𝗡𝗔𝗠𝗘\n━━━━━━━━━━━━━━━━━━━\n❌ Failed: ${e.message}`, threadID, messageID);
    }
  }
};
