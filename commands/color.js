module.exports = {
  config: { name: 'color', aliases: ['setcolor', 'theme'], description: 'Set group chat color/theme', usage: 'color <hex|name>', category: 'Admin', role: 1, cooldown: 5 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const colors = { red:'#FF0000', blue:'#0084FF', green:'#00C853', purple:'#7B2FF7', pink:'#FF006E', yellow:'#FFAB00', orange:'#FF6D00', white:'#FFFFFF', black:'#000000' };
    let color = args[0] || 'blue';
    const resolved = colors[color.toLowerCase()] || (color.startsWith('#') ? color : `#${color}`);
    try {
      await api.changeThreadColor(resolved, threadID);
      api.sendMessage(`🎨 𝗖𝗵𝗮𝘁 𝗖𝗼𝗹𝗼𝗿\n━━━━━━━━━━━━━━━━━━━\n✅ Color set to: ${resolved}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed: ${e.message}`, threadID, messageID); }
  }
};
