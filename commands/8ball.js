module.exports = {
  config: { name: '8ball', aliases: ['magic', 'fortune'], description: 'Ask the magic 8-ball a question', usage: '8ball <question>', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const q = args.join(' ').trim();
    if (!q) return api.sendMessage(`🎱 Ask a question!\nExample: /8ball Will I pass my exam?`, threadID, messageID);
    const answers = [
      '✅ It is certain.','✅ Absolutely yes!','✅ Without a doubt.','✅ Yes, definitely!','✅ You may rely on it.',
      '🤔 Ask again later.','🤔 Cannot predict now.','🤔 Concentrate and ask again.',
      '❌ Don\'t count on it.','❌ My reply is no.','❌ Very doubtful.','❌ Outlook not so good.'
    ];
    const ans = answers[Math.floor(Math.random() * answers.length)];
    api.sendMessage(
      `🎱 𝗠𝗮𝗴𝗶𝗰 𝟴-𝗕𝗮𝗹𝗹\n━━━━━━━━━━━━━━━━━━━\n❓ ${q}\n\n💬 ${ans}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
