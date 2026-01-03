module.exports = {
  name: 'spotify',
  aliases: ['spotifydl', 'spoti', 'spt'],
  description: 'Downloads songs from Spotify',
  run: async (context) => {
    const { client, m } = context;

    try {
      const query = m.text.trim();
      if (!query) return m.reply("Give me a song name, you tone-deaf cretin.");

      if (query.length > 100) return m.reply("Your 'song title' is longer than my patience. 100 characters MAX.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
      const statusMsg = await m.reply(`Searching Spotify for "${query}"... This better be worth my time.`);

      const response = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.status || !data.result?.download) {
        await client.sendMessage(m.chat, { delete: statusMsg.key });
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No song found for "${query}". Your music taste is as bad as your search skills.`);
      }

      const song = data.result;
      const audioUrl = song.download;
      const filename = song.title || "Unknown Song";
      const artist = song.artists || "Unknown Artist";

      await client.sendMessage(m.chat, { delete: statusMsg.key });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

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

      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: `🥀 ${filename} - ${artist}\n—\n🄵🄴🄴-🅇🄼🄳`
      }, { quoted: m });

    } catch (error) {
      console.error('Spotify error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Spotify download failed. The universe rejects your music taste.\nError: ${error.message}`);
    }
  }
};