module.exports = {
  name: 'play',
  aliases: ['play', 'p', 'pl'],
  description: 'Downloads songs from Spotify and sends audio',
  run: async (context) => {
    const { client, m } = context;

    try {
      const query = m.text.trim();
      if (!query) return m.reply("Give me a song name, you tone-deaf cretin.");

      if (query.length > 100) return m.reply("Your 'song title' is longer than my patience. 100 characters MAX.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      const response = await fetch(
        `https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!data.status || !data.result?.download) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No song found for "${query}". Your music taste is as bad as your search skills.`);
      }

      const song = data.result;
      const audioUrl = song.download;
      const filename = song.title || "Unknown Song";
      const artist = song.artists || "Unknown Artist";

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // 🔘 BUTTON MESSAGE
      await client.sendMessage(m.chat, {
        image: { url: song.image || "" },
        caption: `🎵 *${filename}*\n👤 ${artist}\n\nChoose an option below 👇`,
        footer: 'Spotify Player',
        buttons: [
          {
            buttonId: `play_audio_${m.id}`,
            buttonText: { displayText: '🎧 Play Audio' },
            type: 1
          },
          {
            buttonId: `download_mp3_${m.id}`,
            buttonText: { displayText: '⬇️ Download MP3' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m });

      // 🎧 AUDIo
      await client.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: filename.substring(0, 30),
            body: artist.substring(0, 30),
            thumbnailUrl: song.image || "",
            sourceUrl: song.external_url || "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: m });

      // ⬇️ MP3 DOCUMENT 
      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: `🎵 ${filename} - ${artist}\n—\nPowered By You`
      }, { quoted: m });

    } catch (error) {
      console.error('Spotify error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(
        `Spotify download failed. The universe rejects your music taste.\nError: ${error.message}`
      );
    }
  }
};
