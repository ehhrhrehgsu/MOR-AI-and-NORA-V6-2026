module.exports = {
  config: { name: 'poll', aliases: ['vote'], description: 'Create a poll with options', usage: 'poll <title> | option1 | option2 | ...', category: 'Utility', role: 0, cooldown: 10 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ');
    const parts = text.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return api.sendMessage(
      `📊 𝗣𝗼𝗹𝗹 𝗖𝗿𝗲𝗮𝘁𝗼𝗿\n━━━━━━━━━━━━━━━━━━━\n❌ Need at least 2 options.\n📌 Usage: /poll Question | Option1 | Option2`,
      threadID, messageID
    );
    const title = parts[0];
    const options = parts.slice(1);
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const optLines = options.map((o, i) => `${emojis[i]||`${i+1}.`} ${o}`).join('\n');
    api.sendMessage(
      `📊 𝗣𝗼𝗹𝗹: ${title}\n━━━━━━━━━━━━━━━━━━━\n${optLines}\n━━━━━━━━━━━━━━━━━━━\n💡 React with the number to vote!\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
