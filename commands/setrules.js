const fs = require('fs'), path = require('path');
const rulesFile = path.join(__dirname, '../data/rules.json');
function loadRules() {
  try { if (!fs.existsSync(path.dirname(rulesFile))) fs.mkdirSync(path.dirname(rulesFile),{recursive:true}); return JSON.parse(fs.readFileSync(rulesFile,'utf8')); } catch(e) { return {}; }
}
function saveRules(d) { fs.writeFileSync(rulesFile, JSON.stringify(d,null,2)); }

module.exports = {
  config: {
    name: 'setrules',
    aliases: ['addrules', 'rules-set'],
    description: 'Set group rules (admin only)',
    usage: 'setrules <rules text>',
    category: 'Admin',
    role: 1
  },
  async onStart({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const text = args.join(' ').trim();
    if (!text) return api.sendMessage(
      `📋 𝗦𝗘𝗧 𝗥𝗨𝗟𝗘𝗦\n━━━━━━━━━━━━━━━━━━━\n❌ Please provide the rules text.\n📌 Usage: /setrules No spam. Be respectful.`,
      threadID, messageID
    );
    const rules = loadRules();
    rules[threadID] = { text, setBy: senderID, setAt: new Date().toLocaleString() };
    saveRules(rules);
    api.sendMessage(
      `📋 𝗦𝗘𝗧 𝗥𝗨𝗟𝗘𝗦\n━━━━━━━━━━━━━━━━━━━\n✅ Group rules have been set!\n\n📜 ${text}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
