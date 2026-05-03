module.exports = {
  config: { name: 'nick', aliases: ['nickname', 'setnick'], description: 'Set nickname for a member', usage: 'nick @user <nickname> | nick me <nickname>', category: 'Utility', role: 0, cooldown: 5 },
  async run({ api, event, args, senderID }) {
    const { threadID, messageID, mentions } = event;
    const uids = Object.keys(mentions || {});
    let uid = uids[0] || event.senderID;
    const nick = args.slice(uids.length > 0 ? 1 : 0).join(' ').trim() || '';
    if (!nick) return api.sendMessage(`📛 Usage: /nick @user NewName\n💡 Or /nick me MyName`, threadID, messageID);
    try {
      await api.changeNickname(nick, threadID, uid);
      api.sendMessage(`📛 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲\n━━━━━━━━━━━━━━━━━━━\n✅ Nickname set to: "${nick}"\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed: ${e.message}`, threadID, messageID); }
  }
};
