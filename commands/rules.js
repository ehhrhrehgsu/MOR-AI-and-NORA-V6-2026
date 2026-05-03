const groupRules = new Map();
module.exports = {
  config: { name: 'rules', aliases: ['setrules', 'getrules'], description: 'Set or view group rules', usage: 'rules [set <text> | clear]', category: 'Admin', role: 1, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const sub = args[0]?.toLowerCase();
    if (sub === 'set') {
      const text = args.slice(1).join(' ');
      if (!text) return api.sendMessage(`❌ Provide rules text.\nUsage: /rules set <your rules here>`, threadID, messageID);
      groupRules.set(threadID, text);
      return api.sendMessage(`📜 𝗚𝗿𝗼𝘂𝗽 𝗥𝘂𝗹𝗲𝘀 𝗦𝗲𝘁!\n━━━━━━━━━━━━━━━━━━━\n${text}\n━━━━━━━━━━━━━━━━━━━\n✅ Rules saved successfully!`, threadID, messageID);
    }
    if (sub === 'clear') { groupRules.delete(threadID); return api.sendMessage(`🗑️ Rules cleared.`, threadID, messageID); }
    const current = groupRules.get(threadID);
    if (!current) return api.sendMessage(`📜 𝗚𝗿𝗼𝘂𝗽 𝗥𝘂𝗹𝗲𝘀\n━━━━━━━━━━━━━━━━━━━\n❌ No rules set yet.\n💡 Use /rules set <text> to add rules.`, threadID, messageID);
    api.sendMessage(`📜 𝗚𝗿𝗼𝘂𝗽 𝗥𝘂𝗹𝗲𝘀\n━━━━━━━━━━━━━━━━━━━\n${current}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
  }
};
