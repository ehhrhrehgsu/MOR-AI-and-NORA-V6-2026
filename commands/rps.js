module.exports = {
  config: { name: 'rps', aliases: ['rockpaperscissors'], description: 'Play Rock Paper Scissors with the bot', usage: 'rps <rock|paper|scissors>', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const choices = ['rock','paper','scissors'];
    const emojis = { rock:'🪨', paper:'📄', scissors:'✂️' };
    const player = args[0]?.toLowerCase();
    if (!choices.includes(player)) return api.sendMessage(`🎮 Usage: /rps rock | paper | scissors`, threadID, messageID);
    const bot = choices[Math.floor(Math.random() * 3)];
    let result;
    if (player === bot) result = '🤝 It\'s a tie!';
    else if ((player==='rock'&&bot==='scissors')||(player==='paper'&&bot==='rock')||(player==='scissors'&&bot==='paper')) result = '🎉 You win!';
    else result = '🤖 Bot wins!';
    api.sendMessage(
      `🎮 𝗥𝗼𝗰𝗸 𝗣𝗮𝗽𝗲𝗿 𝗦𝗰𝗶𝘀𝘀𝗼𝗿𝘀\n━━━━━━━━━━━━━━━━━━━\n👤 You: ${emojis[player]} ${player}\n🤖 Bot: ${emojis[bot]} ${bot}\n━━━━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
