module.exports = {
  config: { name: 'thread', aliases: ['groupinfo', 'info'], description: 'Show group/thread information', usage: 'thread', category: 'Info', role: 0, cooldown: 5 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const info = await api.getThreadInfo(threadID);
      const admins = (info.adminIDs || []).map(a => a.id).join(', ') || 'None';
      api.sendMessage(
        `🏠 𝗧𝗵𝗿𝗲𝗮𝗱 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n` +
        `📛 𝗡𝗮𝗺𝗲: ${info.threadName || 'Unknown'}\n` +
        `🆔 𝗜𝗗: ${threadID}\n` +
        `👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${info.participantIDs?.length || 0}\n` +
        `👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${admins}\n` +
        `🔒 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${info.approvalMode ? 'ON' : 'OFF'}\n` +
        `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID); }
  }
};
