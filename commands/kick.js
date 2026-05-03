module.exports = {
  config: {
    name: 'kick',
    aliases: ['remove', 'boot'],
    description: 'Kick a tagged member from the group',
    usage: 'kick @tag | reply to kick',
    category: 'Admin',
    role: 1,
    cooldown: 5
  },
  async run({ api, event, args }) {
    const { threadID, messageID, mentions, messageReply } = event;
    const uids = Object.keys(mentions || {});
    const targets = uids.length > 0 ? uids : (messageReply ? [messageReply.senderID] : []);
    if (!targets.length) return api.sendMessage(
      `👢 𝗞𝗜𝗖𝗞 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n❌ Tag someone or reply to kick.\n📌 Usage: /kick @user`,
      threadID, messageID
    );
    let kicked = 0, failed = 0;
    for (const uid of targets) {
      try { await api.removeUserFromGroup(uid, threadID); kicked++; }
      catch(e) { failed++; }
    }
    api.sendMessage(
      `👢 𝗞𝗜𝗖𝗞 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Kicked: ${kicked} member(s)\n${failed?`❌ Failed: ${failed}\n`:``}━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
