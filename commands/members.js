module.exports = {
  config: { name: 'members', aliases: ['list', 'memberlist'], description: 'List all group members', usage: 'members', category: 'Info', role: 0, cooldown: 10 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const info = await api.getThreadInfo(threadID);
      const count = info.participantIDs?.length || 0;
      const admins = (info.adminIDs || []).map(a => a.id);
      const adminStr = admins.length ? admins.slice(0,5).join('\n  ') : 'None';
      api.sendMessage(
        `👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀 𝗟𝗶𝘀𝘁\n━━━━━━━━━━━━━━━━━━━\n` +
        `🏠 𝗚𝗿𝗼𝘂𝗽: ${info.threadName || threadID}\n` +
        `👥 𝗧𝗼𝘁𝗮𝗹: ${count} members\n` +
        `👑 𝗔𝗱𝗺𝗶𝗻𝘀 (${admins.length}):\n  ${adminStr}\n` +
        `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID); }
  }
};
