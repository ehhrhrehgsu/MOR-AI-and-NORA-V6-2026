module.exports = {
  config: {
    name: 'announce',
    aliases: ['ann', 'broadcast', 'notice'],
    description: 'Send an announcement to the group',
    usage: 'announce <message>',
    category: 'Admin',
    role: 1
  },
  async onStart({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ').trim();
    if (!text) return api.sendMessage(`📢 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘\n━━━━━━━━━━━━━━━━━━━\n❌ Please provide a message.`, threadID, messageID);
    api.sendMessage(
      `📢 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${text}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `⏰ ${new Date().toLocaleString()}\n` +
      `✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
