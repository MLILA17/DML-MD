module.exports = {
  name: 'play2',
  aliases: ['ply', 'p2', 'pl2'],
  description: 'Downloads songs from YouTube and sends audio',
  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';

      if (!query) {
        return m.reply(`╭━〔 🎵 DML MUSIC ENGINE 〕━⬣
┃ ⚠️ No input detected.
┃ 
┃ ➤ Send a song name or YouTube link.
┃ 
┃ ✦ Example:
┃   .play harlem shake
┃   .play https://youtu.be/dQw4w9WgXcQ
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Powered by Dml Tech`);
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?[a-zA-Z0-9_-]{11})/gi.test(query);

      let audioUrl, filename, thumbnail, sourceUrl;

      if (isYoutubeLink) {
        const response = await fetch(`https://api.sidycoders.xyz/api/ytdl?url=${encodeURIComponent(query)}&format=mp3&apikey=memberdycoders`);
        const data = await response.json();

        if (!data.status || !data.cdn) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`╭━〔 ❌ DOWNLOAD FAILED 〕━⬣
┃ Unable to process that YouTube link.
┃ 
┃ ➤ Possible Reasons:
┃   • Invalid link
┃   • Private video
┃   • Region restricted
┃ 
┃ Please try another link.
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DML-MD Audio System`);
        }

        audioUrl = data.cdn;
        filename = data.title || "Unknown YouTube Song";
        thumbnail = "";
        sourceUrl = query;
      } else {
        if (query.length > 100) {
          return m.reply(`╭━〔 ⚠️ INPUT LIMIT 〕━⬣
┃ Song title exceeds limit.
┃ 
┃ ➤ Maximum allowed: 100 characters.
┃ Please shorten your search.
╰━━━━━━━━━━━━━━━━━━⬣
> 🎧 DML-MD`);
        }

        const response = await fetch(`https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.status || !data.result?.downloadUrl) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`╭━〔 🔎 NO RESULTS FOUND 〕━⬣
┃ No matching results for:
┃ ➤ "${query}"
┃ 
┃ Try:
┃   • Different keywords
┃   • Artist name + song title
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DML Search Engine`);
        }

        audioUrl = data.result.downloadUrl;
        filename = data.result.title || "Unknown Song";
        thumbnail = data.result.thumbnail || "";
        sourceUrl = data.result.videoUrl || "";
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: thumbnail ? {
          externalAdReply: {
            title: filename.substring(0, 30),
            body: "DML-MD",
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        } : undefined,
      }, { quoted: m });

      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: `╭━〔 🎶 NOW PLAYING 〕━⬣
┃ 🎧 ${filename}
┃ 
┃ ⬇️ Download completed successfully
┃ 📀 Format: MP3
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by Dml`
      }, { quoted: m });

    } catch (error) {
      console.error('Play error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`╭━〔 🚨 PLAY ERROR 〕━⬣
┃ Something went wrong while processing.
┃ 
┃ Error:
┃ ${error.message}
┃ 
┃ Please try again later.
╰━━━━━━━━━━━━━━━━━━⬣
> 🛠️ DML-MD System`);
    }
  }
};
