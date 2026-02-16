const fetch = require('node-fetch');

module.exports = {
  name: 'play',
  aliases: ['ply', 'p', 'pl'],
  description: 'Download and send YouTube audio (MP3)',
  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';

      // ───── NO QUERY ─────
      if (!query) {
        return m.reply(`╭━━━〔 🎵 DML-MD PLAYER 〕━━━⬣
┃ ❖ Please provide a song name or YouTube link.
┃
┃ ➤ Example:
┃   .play Shape of You
┃   .play https://youtu.be/dQw4w9WgXcQ
╰━━━━━━━━━━━━━━━━━━⬣
> Powered By Dml`);
      }

      await client.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

      const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)[a-zA-Z0-9_-]{11})/gi.test(query);

      let audioUrl, filename, thumbnail, sourceUrl;

      // ───── DIRECT YOUTUBE LINK ─────
      if (isYoutubeLink) {

        const response = await fetch(`https://api.sidycoders.xyz/api/ytdl?url=${encodeURIComponent(query)}&format=mp3&apikey=memberdycoders`);
        const data = await response.json();

        if (!data.status || !data.cdn) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`╭━━━〔 ❌ DOWNLOAD FAILED 〕━━━⬣
┃ Unable to download this YouTube link.
┃ It may be private, invalid or unavailable.
╰━━━━━━━━━━━━━━━━━━⬣
> DML-MD`);
        }

        audioUrl = data.cdn;
        filename = data.title || "Unknown Track";
        thumbnail = "";
        sourceUrl = query;

      } else {

        if (query.length > 100) {
          return m.reply(`╭━━━〔 ⚠️ LIMIT EXCEEDED 〕━━━⬣
┃ Song title must not exceed 100 characters.
╰━━━━━━━━━━━━━━━━━━⬣
> DML-MD`);
        }

        const response = await fetch(`https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.status || !data.result?.downloadUrl) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`╭━━━〔 🔎 NO RESULTS FOUND 〕━━━⬣
┃ No results found for:
┃ "${query}"
╰━━━━━━━━━━━━━━━━━━⬣
> DML-MD`);
        }

        audioUrl = data.result.downloadUrl;
        filename = data.result.title || "Unknown Track";
        thumbnail = data.result.thumbnail || "";
        sourceUrl = data.result.videoUrl || "";
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // ───── SEND AUDIO ─────
      await client.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: thumbnail ? {
          externalAdReply: {
            title: filename.substring(0, 30),
            body: "DML-MD Music Player",
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        } : undefined,
      }, { quoted: m });

      // ───── SEND DOCUMENT COPY ─────
      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: `╭━━━〔 🎶 NOW PLAYING 〕━━━⬣
┃ Title : ${filename}
┃ Format: MP3 Audio
╰━━━━━━━━━━━━━━━━━━⬣
> DML-MD High Quality Audio`
      }, { quoted: m });

    } catch (error) {

      console.error('Play error:', error);

      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      await m.reply(`╭━━━〔 ⚠️ SYSTEM ERROR 〕━━━⬣
┃ Something went wrong while processing
┃ your request.
┃
┃ Error: ${error.message}
╰━━━━━━━━━━━━━━━━━━⬣
> DML-MD`);
    }
  }
};
