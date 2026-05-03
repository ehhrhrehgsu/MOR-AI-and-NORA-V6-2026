module.exports = {
  config: { name: 'calc', aliases: ['math', 'calculate'], description: 'Calculate a math expression', usage: 'calc <expression>', category: 'Utility', role: 0, cooldown: 2 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const expr = args.join(' ').replace(/[^0-9+\-*/().%^ ]/g, '');
    if (!expr) return api.sendMessage(`🧮 Usage: /calc 2+2*10\n📌 Supports: + - * / % ()`, threadID, messageID);
    try {
      // Safe eval using Function
      const result = Function(`'use strict'; return (${expr})`)();
      api.sendMessage(
        `🧮 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥\n━━━━━━━━━━━━━━━━━━━\n📝 𝗘𝘅𝗽𝗿: ${expr}\n✅ 𝗥𝗲𝘀𝘂𝗹𝘁: ${result}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
        threadID, messageID
      );
    } catch(e) { api.sendMessage(`❌ Invalid expression: ${expr}`, threadID, messageID); }
  }
};
