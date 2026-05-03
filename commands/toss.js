module.exports = {
  config: { name: 'toss', aliases: ['flip', 'coinflip'], description: 'Flip a coin (heads or tails)', usage: 'toss', category: 'Fun', role: 0, cooldown: 2 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    const result = Math.random() < 0.5 ? '🪙 HEADS' : '🪙 TAILS';
    api.sendMessage(
      `🪙 𝗖𝗼𝗶𝗻 𝗙𝗹𝗶𝗽\n━━━━━━━━━━━━━━━━━━━\n🎯 Result: ${result}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
