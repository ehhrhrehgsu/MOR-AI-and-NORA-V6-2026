module.exports = {
  config: { name: 'dice', aliases: ['roll', 'random'], description: 'Roll a dice (1-6)', usage: 'dice [sides]', category: 'Fun', role: 0, cooldown: 2 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const sides = parseInt(args[0]) || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    const faces = ['', '⚀','⚁','⚂','⚃','⚄','⚅'];
    api.sendMessage(
      `🎲 𝗗𝗶𝗰𝗲 𝗥𝗼𝗹𝗹\n━━━━━━━━━━━━━━━━━━━\n${sides === 6 ? faces[result] : '🎲'} Result: ${result}/${sides}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
