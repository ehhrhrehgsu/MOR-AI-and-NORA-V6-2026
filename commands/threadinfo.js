module.exports = {
  config: {
    name: 'threadinfo',
    aliases: ['groupinfo', 'thread', 'ginfo'],
    description: 'Show group/thread information',
    usage: 'threadinfo',
    category: 'Info',
    role: 0
  },
  async onStart({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const info = await api.getThreadInfo(threadID);
      const admins = info.adminIDs?.map(a => a.id).join(', ') || 'None';
      api.sendMessage(
        `📊 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ 𝗡𝗮𝗺𝗲: ${info.threadName || 'Unknown'}\n` +
        `👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${info.participantIDs?.length || 0}\n` +
        `👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${admins}\n` +
        `🆔 𝗧𝗵𝗿𝗲𝗮𝗱 𝗜𝗗: ${threadID}\n` +
        `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) {
      api.sendMessage(`📊 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n❌ Error: ${e.message}`, threadID, messageID);
    }
  }
};
