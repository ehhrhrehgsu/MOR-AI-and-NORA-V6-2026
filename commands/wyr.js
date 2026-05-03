const questions = [
  ['fly','be invisible'],['be rich','be famous'],['live in the past','live in the future'],
  ['have super strength','have super speed'],['always be cold','always be hot'],
  ['never sleep','never eat'],['speak all languages','play all instruments']
];
module.exports = {
  config: { name: 'wyr', aliases: ['wouldyourather'], description: 'Would You Rather game', usage: 'wyr', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event }) {
    const { threadID, messageID } = event;
    const [a, b] = questions[Math.floor(Math.random() * questions.length)];
    api.sendMessage(
      `🤔 𝗪𝗼𝘂𝗹𝗱 𝗬𝗼𝘂 𝗥𝗮𝘁𝗵𝗲𝗿?\n━━━━━━━━━━━━━━━━━━━\n🅰️ ${a.toUpperCase()}\n\n𝗢𝗥\n\n🅱️ ${b.toUpperCase()}\n━━━━━━━━━━━━━━━━━━━\n💬 Reply A or B!\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
