module.exports = {
  config: {
    name: 'help',
    aliases: ['cmds', 'commands'],
    description: 'Show all available commands',
    usage: 'help [command]',
    category: 'General'
  },
  async run({ api, event, args, commands, prefix }) {
    const { threadID, messageID } = event;
    if (args[0]) {
      const cmd = commands.get(args[0].toLowerCase());
      if (!cmd) return api.sendMessage(`❌ Command "${args[0]}" not found.`, threadID, messageID);
      return api.sendMessage(
        `📌 Command: ${cmd.config.name}\n` +
        `📝 Description: ${cmd.config.description}\n` +
        `🔧 Usage: ${prefix}${cmd.config.usage}\n` +
        `📂 Category: ${cmd.config.category}`,
        threadID, messageID
      );
    }
    const list = [...commands.values()].map(c => `• ${prefix}${c.config.name} - ${c.config.description}`).join('\n');
    api.sendMessage(`🤖 NORA AI V10 Commands:\n\n${list}\n\nTotal: ${commands.size} commands`, threadID, messageID);
  }
};
