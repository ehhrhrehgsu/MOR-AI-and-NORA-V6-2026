const { getUniqueCommands } = require('../utils');
module.exports = {
  config: { name: 'botinfo', aliases: ['about', 'version'], description: 'Show bot information and stats', usage: 'botinfo', category: 'Info', role: 0, cooldown: 5 },
  async run({ api, event, commands, botStartTime }) {
    const { threadID, messageID } = event;
    const uptime = (() => { const d=Date.now()-(botStartTime||Date.now()); return `${Math.floor(d/3600000)}h ${Math.floor((d%3600000)/60000)}m`; })();
    const cmdCount = getUniqueCommands(commands).length;
    api.sendMessage(
      `🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n` +
      `📛 𝗡𝗮𝗺𝗲: NORA AI V10\n` +
      `🔖 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: 3.8\n` +
      `⚙️ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${cmdCount}\n` +
      `⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}\n` +
      `🧠 𝗔𝗜: DeepSeek V3\n` +
      `💻 𝗟𝗮𝗻𝗴: Node.js\n` +
      `👨‍💻 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆: Base44 & Nora V10\n` +
      `📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: Manuel Sonyasis\n` +
      `━━━━━━━━━━━━━━━━━━━\n✨ 𝗕𝘂𝗶𝗹𝘁 𝘄𝗶𝘁𝗵 ❤️ 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
