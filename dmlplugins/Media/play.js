module.exports = {
  name: 'play',
  aliases: ['p', 'playy', 'pl'],
  description: 'Search Spotify and send audio via button',

  run: async (context) => {
    const { client, m, config } = context;

    try {
      const query = m.text?.trim();
      if (!query) return m.reply("Give me a song name, you tone-deaf cretin.");
      if (query.length > 100) return m.reply("Your 'song title' is longer than my patience. 100 characters MAX.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      // Fetch Spotify data
      const response = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.status || !data.result?.download) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No song found for "${query}".`);
      }

      const song = data.result;

      // Encode data safely for button
      const payload = Buffer.from(JSON.stringify({
        url: song.download,
        title: song.title || 'Unknown Song',
        artist: song.artists || 'Unknown Artist',
        image: song.image || '',
        newsletterJid: '120363403958418756@newsletter',
        newsletterName: config?.OWNER_NAME || 'DML-MD',
        serverMessageId: 143
      })).toString('base64');

      // Send button only
      await client.sendMessage(m.chat, {
        image: { url: song.image || '' },
        caption: `🎵 *${song.title}*\n👤 ${song.artists}\n\nClick below to play audio 👇`,
        footer: 'Spotify Player',
        buttons: [
          {
            buttonId: `PLAY_AUDIO:${payload}`,
            buttonText: { displayText: '🎧 Play Audio' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('Spotify error:', err);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Spotify download failed.\nError: ${err.message}`);
    }
  },

  // 🔘 Button handler
  handler: async (context) => {
    const { client, m } = context;

    if (!m.buttonId) return;

    try {
      const [action, encoded] = m.buttonId.split(':');
      if (!encoded) return;

      const data = JSON.parse(Buffer.from(encoded, 'base64').toString());
      const { url, title, artist, image, newsletterJid, newsletterName, serverMessageId } = data;

      if (action === 'PLAY_AUDIO') {
        await client.sendMessage(
          m.chat,
          {
            audio: { url },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            contextInfo: {
              externalAdReply: {
                title: title.substring(0, 30),
                body: artist.substring(0, 30),
                thumbnailUrl: image,
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: true
              },
              forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId
              }
            }
          },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error('Button error:', err);
      await m.reply('Failed to send audio. Try again.');
    }
  }
};
