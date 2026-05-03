module.exports = {
  config: {
    name: 'tag',
    aliases: ['tagall', 'mentionall', 'everyone'],
    description: 'Tag all members in the group',
    usage: 'tag [message]',
    category: 'Admin',
    role: 1,
    countDown: 30
  },
  async onStart({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ').trim() || '📢 Attention everyone!';
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs || [];
      const mentions = members.map(id => ({ id, tag: `@` }));
      const body = `${text}\n` + members.map(() => `@`).join(' ');
      api.sendMessage({ body, mentions }, threadID, messageID);
    } catch(e) {
      api.sendMessage(`🏷️ 𝗧𝗔𝗚 𝗔𝗟𝗟\n━━━━━━━━━━━━━━━━━━━\n❌ Failed: ${e.message}`, threadID, messageID);
    }
  }
};
