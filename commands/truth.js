const truths = [
  'What is your biggest fear?','Who do you have a crush on?','What is your most embarrassing moment?',
  'Have you ever lied to a friend?','What is your biggest regret?','What is your secret talent?',
  'Who was your first love?','What is something you have never told anyone?',
  'Have you ever cheated on a test?','What is your biggest insecurity?'
];
const dares = [
  'Send a voice message singing a song','Change your profile picture for 1 day',
  'Tag 3 friends and say something nice about them','Post something embarrassing as your status',
  'Send a selfie right now','Do 10 push-ups','Say the alphabet backwards',
  'Write a poem about the person above you','Send a voice message of you laughing for 10 seconds'
];
module.exports = {
  config: { name: 'truth', aliases: ['dare', 'tod'], description: 'Truth or Dare game', usage: 'truth | dare', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const cmd = (args[0] || 'truth').toLowerCase();
    if (cmd === 'dare') {
      const d = dares[Math.floor(Math.random() * dares.length)];
      return api.sendMessage(`🔥 𝗗𝗔𝗥𝗘!\n━━━━━━━━━━━━━━━━━━━\n😈 ${d}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    }
    const t = truths[Math.floor(Math.random() * truths.length)];
    api.sendMessage(`💬 𝗧𝗥𝗨𝗧𝗛!\n━━━━━━━━━━━━━━━━━━━\n🤔 ${t}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
  }
};
