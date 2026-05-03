const { getUniqueCommands } = require('../utils');
const PER_PAGE = 10;

module.exports = {
  config: {
    name: 'help',
    aliases: ['cmds', 'h'],
    description: 'Show all available commands',
    usage: 'help [page|command]',
    category: 'General'
  },
  async run({ api, event, args, commands, prefix }) {
    const { threadID, messageID } = event;
    const unique = getUniqueCommands(commands);

    // Specific command info
    if (args[0] && isNaN(args[0])) {
      const cmd = commands.get(args[0].toLowerCase());
      if (!cmd) return api.sendMessage(
        `𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬 ✦ Command Info\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `❌ Command "${args[0]}" not found.\n` +
        `💡 Type ${prefix}help to see all commands.`,
        threadID, messageID
      );
      return api.sendMessage(
        `𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬 ✦ Command Info\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📌 𝗡𝗮𝗺𝗲: ${cmd.config.name}\n` +
        `📝 𝗗𝗲𝘀𝗰: ${cmd.config.description}\n` +
        `🔧 𝗨𝘀𝗮𝗴𝗲: ${prefix}${cmd.config.usage}\n` +
        `📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${cmd.config.category}\n` +
        `👑 𝗥𝗼𝗹𝗲: ${cmd.config.role === 2 ? 'Bot Admin' : cmd.config.role === 1 ? 'Group Admin' : 'Everyone'}\n` +
        `⏱️ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cmd.config.cooldown}s`,
        threadID, messageID
      );
    }

    const totalPages = Math.ceil(unique.length / PER_PAGE);
    let page = parseInt(args[0]) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PER_PAGE;
    const slice = unique.slice(start, start + PER_PAGE);

    const lines = slice.map((c, i) =>
      `${start + i + 1}. 𝗰𝗺𝗱: ${prefix}${c.config.name}\n` +
      `    ↳ ${c.config.description || 'No description'}`
    ).join('\n');

    api.sendMessage(
      `🤖 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟬 — 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📄 𝗣𝗮𝗴𝗲 ${page}/${totalPages} ✦ ${unique.length} total\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `${lines}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💡 ${prefix}help [page] — e.g. ${prefix}help ${Math.min(page+1,totalPages)}\n` +
      `💡 ${prefix}help [name] — e.g. ${prefix}help ai\n` +
      `✨ Powered by Base44 & Nora V10`,
      threadID, messageID
    );
  }
};
