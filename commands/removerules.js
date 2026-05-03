const fs = require('fs'), path = require('path');
const rulesFile = path.join(__dirname, '../data/rules.json');
function loadRules() { try { return JSON.parse(fs.readFileSync(rulesFile,'utf8')); } catch(e) { return {}; } }
function saveRules(d) { fs.writeFileSync(rulesFile, JSON.stringify(d,null,2)); }

module.exports = {
  config: {
    name: 'removerules',
    aliases: ['delrules', 'clearrules'],
    description: 'Remove group rules (admin only)',
    usage: 'removerules',
    category: 'Admin',
    role: 1
  },
  async onStart({ api, event }) {
    const { threadID, messageID } = event;
    const rules = loadRules();
    if (!rules[threadID]) return api.sendMessage(`📋 𝗥𝗘𝗠𝗢𝗩𝗘 𝗥𝗨𝗟𝗘𝗦\n━━━━━━━━━━━━━━━━━━━\n❌ No rules found for this group.`, threadID, messageID);
    delete rules[threadID];
    saveRules(rules);
    api.sendMessage(`📋 𝗥𝗘𝗠𝗢𝗩𝗘 𝗥𝗨𝗟𝗘𝗦\n━━━━━━━━━━━━━━━━━━━\n✅ Group rules have been removed!\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
  }
};
