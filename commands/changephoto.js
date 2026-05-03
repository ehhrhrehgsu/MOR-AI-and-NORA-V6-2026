const axios = require('axios');
module.exports = {
  config: { name: 'changephoto', aliases: ['setphoto', 'groupphoto'], description: 'Change group photo (reply to an image or provide URL)', usage: 'changephoto [url] | reply to image', category: 'Admin', role: 1, cooldown: 10 },
  async run({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let stream;
    try {
      // Check reply attachment
      if (messageReply?.attachments?.[0]?.type === 'photo') {
        const url = messageReply.attachments[0].largePreviewUrl || messageReply.attachments[0].previewUrl;
        const res = await axios({ url, method: 'GET', responseType: 'stream', timeout: 15000 });
        stream = res.data;
      } else if (args[0] && args[0].startsWith('http')) {
        const res = await axios({ url: args[0], method: 'GET', responseType: 'stream', timeout: 15000 });
        stream = res.data;
      } else {
        return api.sendMessage(
          `🖼️ 𝗖𝗵𝗮𝗻𝗴𝗲 𝗣𝗵𝗼𝘁𝗼\n━━━━━━━━━━━━━━━━━━━\n❌ Reply to an image or provide URL.\n📌 Usage: /changephoto [url]\n💡 Or reply to a photo with /changephoto`,
          threadID, messageID
        );
      }
      await api.changeGroupImage(stream, threadID);
      api.sendMessage(`🖼️ 𝗖𝗵𝗮𝗻𝗴𝗲 𝗣𝗵𝗼𝘁𝗼\n━━━━━━━━━━━━━━━━━━━\n✅ Group photo updated!\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟬`, threadID, messageID);
    } catch(e) { api.sendMessage(`❌ Failed: ${e.message}`, threadID, messageID); }
  }
};
