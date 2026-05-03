module.exports = {
  config: { name: 'demote', aliases: ['removeadmin'], description: 'Demote a group admin to member', usage: 'demote @tag | reply', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID, mentions, messageReply } = event;
    const uids = Object.keys(mentions || {});
    const targets = uids.length > 0 ? uids : (messageReply ? [messageReply.senderID] : []);
    if (!targets.length) return api.sendMessage(`❌ Tag someone or reply to demote.\nUsage: /demote @user`, threadID, messageID);
    let ok = 0;
    for (const uid of targets) {
      try { await api.changeAdminStatus(threadID, uid, false); ok++; } catch(e) {}
    }
    api.sendMessage(`⬇️ 𝗗𝗲𝗺𝗼𝘁𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Demoted ${ok} member(s) from admin.\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
  }
};
