module.exports = {
  config: { name: 'love', aliases: ['ship', 'lovemeter'], description: 'Calculate love compatibility between two people', usage: 'love <name1> + <name2>', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ');
    const parts = text.split('+').map(s => s.trim());
    const p1 = parts[0] || 'You', p2 = parts[1] || 'Me';
    const pct = Math.floor(Math.random() * 41) + 60;
    const hearts = '❤️'.repeat(Math.floor(pct/20)) + '🤍'.repeat(5-Math.floor(pct/20));
    const msg = pct >= 90 ? 'Perfect match! 💕' : pct >= 75 ? 'Great compatibility! 💖' : pct >= 60 ? 'Good connection! 💗' : 'Keep trying! 💛';
    api.sendMessage(
      `💘 𝗟𝗼𝘃𝗲 𝗠𝗲𝘁𝗲𝗿\n━━━━━━━━━━━━━━━━━━━\n` +
      `💑 ${p1} + ${p2}\n` +
      `${hearts}\n` +
      `💯 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${pct}%\n` +
      `💬 ${msg}\n` +
      `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
