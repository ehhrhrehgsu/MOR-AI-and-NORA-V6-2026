const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'install',
    aliases: ['addcmd', 'loadcmd'],
    description: 'Install a new command by pasting its code',
    usage: 'install <filename.js> <code>',
    category: 'Admin'
  },
  async run({ api, event, args, adminUID }) {
    const { threadID, messageID, senderID } = event;
    if (senderID !== adminUID && String(senderID) !== String(adminUID)) {
      return api.sendMessage('❌ Only the admin can install commands.', threadID, messageID);
    }
    const body = event.body || '';
    const prefix = body.charAt(0);
    const content = body.slice(prefix.length + 'install'.length).trim();
    if (!content) {
      return api.sendMessage(
        `📦 CMD INSTALL USAGE:\n\n` +
        `${prefix}install kick.js <paste code here>\n\n` +
        `Example:\n` +
        `${prefix}install mycommand.js module.exports = { config: { name: "mycommand", ... }, onStart: ... }`,
        threadID, messageID
      );
    }
    const parts = content.split(/\s+/);
    const filename = parts[0].endsWith('.js') ? parts[0] : null;
    const code = filename ? content.slice(filename.length).trim() : content;
    if (!code || code.length < 20) {
      return api.sendMessage('❌ No valid code detected. Please paste the full command code after the filename.', threadID, messageID);
    }
    const cmdName = filename ? filename.replace('.js', '') : 'unknown';
    const tempPath = path.join(__dirname, `_install_${Date.now()}.js`);
    fs.writeFileSync(tempPath, code);
    try {
      delete require.cache[require.resolve(tempPath)];
      const raw = require(tempPath);
      const name = raw?.config?.name || cmdName;
      const finalPath = path.join(__dirname, `${name}.js`);
      fs.renameSync(tempPath, finalPath);
      api.sendMessage(
        `╔═══════════════════╗\n` +
        `║  📦 CMD INSTALLED  ║\n` +
        `╚═══════════════════╝\n\n` +
        `✅ Command "${name}" installed!\n` +
        `📂 File: ${name}.js\n` +
        `📝 Category: ${raw?.config?.category || 'General'}\n\n` +
        `💡 Use the prefix + help to see it in the list!`,
        threadID, messageID
      );
    } catch (e) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      api.sendMessage(`❌ Install failed: ${e.message}`, threadID, messageID);
    }
  }
};
