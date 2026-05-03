module.exports = {
  config: { name: 'add', aliases: ['invite'], description: 'Add a user to the group by UID', usage: 'add <uid>', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const uid = args[0];
    if (!uid || isNaN(uid)) return api.sendMessage(
      `➕ 𝗔𝗗𝗗 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n❌ Please provide a valid UID.\n📌 Usage: /add 100012345678`,
      threadID, messageID
    );
    try {
      await api.addUserToGroup(uid, threadID);
      api.sendMessage(`➕ 𝗔𝗗𝗗 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ User ${uid} added!\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) {
      api.sendMessage(`❌ Failed to add user: ${e.message}`, threadID, messageID);
    }
  }
};
