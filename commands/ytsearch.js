const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'ytsearch',
    aliases: ['music', 'song', 'yt'],
    description: 'Search and send YouTube music as audio',
    usage: 'ytsearch <song name>',
    category: 'Media'
  },
  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(' ').trim();
    if (!query) return api.sendMessage('🎵 Please provide a song name.\nExample: /ytsearch uhaw', threadID, messageID);

    const searching = await new Promise(resolve => {
      api.sendMessage(`🔎 Searching for: "${query}"...`, threadID, (err, info) => resolve(info));
    });

    try {
      const result = await yts(query);
      const videos = result.videos.slice(0, 1);
      if (!videos.length) {
        return api.sendMessage(`❌ No results found for: "${query}"`, threadID, messageID);
      }
      const video = videos[0];
      const info =
        `╔════════════════════╗\n` +
        `║  🎵  NORA MUSIC V10 ║\n` +
        `╚════════════════════╝\n\n` +
        `🎬 ${video.title}\n` +
        `👤 ${video.author.name}\n` +
        `⏱️ ${video.timestamp}\n` +
        `👁️ ${video.views?.toLocaleString() || '?'} views\n\n` +
        `⏳ Downloading audio...`;
      api.sendMessage(info, threadID);

      const tmpFile = path.join('/tmp', `yt_${Date.now()}.mp3`);
      const writeStream = fs.createWriteStream(tmpFile);
      let downloaded = false;

      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'lowestaudio',
        requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0' } }
      });

      stream.pipe(writeStream);
      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => { downloaded = true; resolve(); });
        stream.on('error', reject);
        writeStream.on('error', reject);
        setTimeout(() => { if (!downloaded) reject(new Error('Download timeout')); }, 60000);
      });

      const fileStream = fs.createReadStream(tmpFile);
      await new Promise((resolve, reject) => {
        api.sendMessage({
          body:
            `🎵 ${video.title}\n` +
            `👤 ${video.author.name} | ⏱️ ${video.timestamp}\n` +
            `✨ Powered by NORA AI V10 & Base44`,
          attachment: fileStream
        }, threadID, (err, info) => {
          fs.unlink(tmpFile, () => {});
          if (err) reject(err); else resolve(info);
        });
      });

      if (searching?.messageID) api.unsendMessage(searching.messageID).catch(()=>{});
    } catch (e) {
      api.sendMessage(
        `╔════════════════════╗\n` +
        `║  🎵  NORA MUSIC V10 ║\n` +
        `╚════════════════════╝\n\n` +
        `❌ Could not download audio.\n` +
        `Reason: ${e.message}\n\n` +
        `💡 Try a different song or shorter track.`,
        threadID, messageID
      );
    }
  }
};
