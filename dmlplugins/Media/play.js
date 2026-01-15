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
        return m.reply(`No song found for "${query}". Your music taste is trash.`);
      }

      const song = data.result;

      //dml
      const buttonIdPlay = `play_audio|${song.download}|${song.title}|${song.artists}|${song.image}`;
      const buttonIdDownload = `download_mp3|${song.download}|${song.title}|${song.artists}`;

      await client.sendMessage(m.chat, {
        image: { url: song.image || "" },
        caption: `🎵 *${song.title}*\n👤 ${song.artists}\n\nChoose what you want 👇`,
        footer: 'Spotify Player',
        buttons: [
          {
            buttonId: buttonIdPlay,
            buttonText: { displayText: '🎧 Play Audio' },
            type: 1
          },
          {
            buttonId: buttonIdDownload,
            buttonText: { displayText: '⬇️ Download MP3' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error(error);
      await m.reply(`Error: ${error.message}`);
    }
  }
};
