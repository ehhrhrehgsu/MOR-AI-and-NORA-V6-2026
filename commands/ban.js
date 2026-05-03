const banned = new Set();
module.exports = {
  config: { name: 'ban', aliases: ['block'], description: 'Ban a user from using bot commands', usage: 'ban @user | reply', category: 'Admin', role: 2, cooldown: 3 },
  async run({ api, event, args, adminUID }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;
    if (senderID !== adminUID && String(senderID) !== String(adminUID))
      return api.sendMessage(`❌ Only bot admin can use this.`, threadID, messageID);
    const uids = Object.keys(mentions || {});
    const targets = uids.length > 0 ? uids : (messageReply ? [messageReply.senderID] : []);
    if (!targets.length) return api.sendMessage(`❌ Tag someone or reply to ban.`, threadID, messageID);
    targets.forEach(u => banned.add(u));
    api.sendMessage(
      `🚫 𝗕𝗔𝗡 𝗖𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━━━━━\n✅ Banned ${targets.length} user(s) from bot.\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
