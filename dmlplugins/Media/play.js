module.exports = {
  name: 'play',
  aliases: ['play', 'p', 'pl'],
  description: 'Search Spotify and show buttons to play or download mp3',

  run: async (context) => {
    const { client, m } = context;

    try {
      const query = m.text?.trim();
      if (!query) return m.reply("Give me a song name, you tone-deaf cretin.");
      if (query.length > 100) return m.reply("Your 'song title' is longer than my patience. 100 characters MAX.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      const response = await fetch(
        `https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!data.status || !data.result?.download) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No song found for "${query}".`);
      }

      const song = data.result;

      // Encode data safely into buttonId
      const payload = Buffer.from(JSON.stringify({
        url: song.download,
        title: song.title || 'Unknown Song',
        artist: song.artists || 'Unknown Artist',
        image: song.image || ''
      })).toString('base64');

      await client.sendMessage(m.chat, {
        image: { url: song.image || '' },
        caption: `🎵 *${song.title}*\n👤 ${song.artists}\n\nChoose an option 👇`,
        footer: 'Spotify Player',
        buttons: [
          {
            buttonId: `PLAY_AUDIO:${payload}`,
            buttonText: { displayText: '🎧 Play Audio' },
            type: 1
          },
          {
            buttonId: `DOWNLOAD_MP3:${payload}`,
            buttonText: { displayText: '⬇️ Download MP3' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error(err);
      await m.reply(`Error: ${err.message}`);
    }
  },

  // 🔘 BUTTON HANDLER
  handler: async (context) => {
    const { client, m } = context;

    if (!m.buttonId) return;

    try {
      const [action, encoded] = m.buttonId.split(':');
      if (!encoded) return;

      const data = JSON.parse(Buffer.from(encoded, 'base64').toString());
      const { url, title, artist, image } = data;

      if (action === 'PLAY_AUDIO') {
        await client.sendMessage(m.chat, {
          audio: { url },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: title.substring(0, 30),
              body: artist.substring(0, 30),
              thumbnailUrl: image,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m });
      }

      if (action === 'DOWNLOAD_MP3') {
        await client.sendMessage(m.chat, {
          document: { url },
          mimetype: 'audio/mpeg',
          fileName: `${title.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
          caption: `🎵 ${title} - ${artist}\n—\nPowered By You`
        }, { quoted: m });
      }

    } catch (err) {
      console.error('Button error:', err);
      await m.reply('Failed to process your request.');
    }
  }
};
