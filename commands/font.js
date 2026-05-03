const fonts = {
  bold:       ['𝗮','𝗯','𝗰','𝗱','𝗲','𝗳','𝗴','𝗵','𝗶','𝗷','𝗸','𝗹','𝗺','𝗻','𝗼','𝗽','𝗾','𝗿','𝘀','𝘁','𝘂','𝘃','𝘄','𝘅','𝘆','𝘇','𝗔','𝗕','𝗖','𝗗','𝗘','𝗙','𝗚','𝗛','𝗜','𝗝','𝗞','𝗟','𝗠','𝗡','𝗢','𝗣','𝗤','𝗥','𝗦','𝗧','𝗨','𝗩','𝗪','𝗫','𝗬','𝗭'],
  italic:     ['𝘢','𝘣','𝘤','𝘥','𝘦','𝘧','𝘨','𝘩','𝘪','𝘫','𝘬','𝘭','𝘮','𝘯','𝘰','𝘱','𝘲','𝘳','𝘴','𝘵','𝘶','𝘷','𝘸','𝘹','𝘺','𝘻','𝘈','𝘉','𝘊','𝘋','𝘌','𝘍','𝘎','𝘏','𝘐','𝘑','𝘒','𝘓','𝘔','𝘕','𝘖','𝘗','𝘘','𝘙','𝘚','𝘛','𝘜','𝘝','𝘞','𝘟','𝘠','𝘡'],
  bolditalic: ['𝙖','𝙗','𝙘','𝙙','𝙚','𝙛','𝙜','𝙝','𝙞','𝙟','𝙠','𝙡','𝙢','𝙣','𝙤','𝙥','𝙦','𝙧','𝙨','𝙩','𝙪','𝙫','𝙬','𝙭','𝙮','𝙯','𝘼','𝘽','𝘾','𝘿','𝙀','𝙁','𝙂','𝙃','𝙄','𝙅','𝙆','𝙇','𝙈','𝙉','𝙊','𝙋','𝙌','𝙍','𝙎','𝙏','𝙐','𝙑','𝙒','𝙓','𝙔','𝙕'],
  mono:       ['𝚊','𝚋','𝚌','𝚍','𝚎','𝚏','𝚐','𝚑','𝚒','𝚓','𝚔','𝚕','𝚖','𝚗','𝚘','𝚙','𝚚','𝚛','𝚜','𝚝','𝚞','𝚟','𝚠','𝚡','𝚢','𝚣','𝙰','𝙱','𝙲','𝙳','𝙴','𝙵','𝙶','𝙷','𝙸','𝙹','𝙺','𝙻','𝙼','𝙽','𝙾','𝙿','𝚀','𝚁','𝚂','𝚃','𝚄','𝚅','𝚆','𝚇','𝚈','𝚉'],
};
const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function convert(text, fontArr) {
  return text.split('').map(c => {
    const idx = normal.indexOf(c);
    return idx >= 0 ? fontArr[idx] : c;
  }).join('');
}

module.exports = {
  config: { name: 'font', aliases: ['fonts', 'style'], description: 'Convert text to stylish Unicode fonts', usage: 'font <text>', category: 'Fun', role: 0, cooldown: 3 },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(' ').trim();
    if (!text) return api.sendMessage(
      `🔤 𝗙𝗢𝗡𝗧 𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗿\n━━━━━━━━━━━━━━━━━━━\n❌ Please provide text!\n📌 Usage: /font Hello World`,
      threadID, messageID
    );
    api.sendMessage(
      `🔤 𝗙𝗢𝗡𝗧 𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗿 ✦ 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬\n━━━━━━━━━━━━━━━━━━━\n` +
      `📝 𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹: ${text}\n\n` +
      `1️⃣ 𝗕𝗼𝗹𝗱: ${convert(text, fonts.bold)}\n` +
      `2️⃣ 𝗜𝘁𝗮𝗹𝗶𝗰: ${convert(text, fonts.italic)}\n` +
      `3️⃣ 𝗕𝗼𝗹𝗱 𝗜𝘁𝗮𝗹𝗶𝗰: ${convert(text, fonts.bolditalic)}\n` +
      `4️⃣ 𝗠𝗼𝗻𝗼: ${convert(text, fonts.mono)}\n` +
      `━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`,
      threadID, messageID
    );
  }
};
