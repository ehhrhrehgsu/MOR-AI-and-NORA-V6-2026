module.exports = {
  config: { name: 'stalk', aliases: ['profile', 'userinfo'], description: 'Get info about a Facebook user', usage: 'stalk @user | reply | uid', category: 'Info', role: 0, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID, mentions, messageReply } = event;
    const uids = Object.keys(mentions || {});
    const uid = uids[0] || (messageReply ? messageReply.senderID : args[0]) || event.senderID;
    try {
      const info = await api.getUserInfo(uid);
      const user = info[uid];
      api.sendMessage(
        `👤 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n` +
        `📛 𝗡𝗮𝗺𝗲: ${user.name || 'Unknown'}\n` +
        `🆔 𝗨𝗜𝗗: ${uid}\n` +
        `👤 𝗚𝗲𝗻𝗱𝗲𝗿: ${user.gender === 'MALE' ? '♂️ Male' : user.gender === 'FEMALE' ? '♀️ Female' : '❓ Unknown'}\n` +
        `🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${user.profileUrl || 'N/A'}\n` +
        `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Failed to get user info: ${e.message}`, threadID, messageID); }
  }
};
