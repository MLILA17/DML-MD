const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("TELL ME A SONG YOU DUMBASS 🤦🏻 EXAMPLE: .lyrics Alan Walker faded");
  }

  try {
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.elrayyxml.web.id/api/search/lyrics?q=${encodedText}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return m.reply(`NO LYRICS FOUND FOR "${text}" 🤡 MAYBE THE SONG SUCKS`);
    }

    const song = data.result[0];
    
    if (!song.lyrics?.plainLyrics) {
      return m.reply(`NO PLAIN LYRICS FOR THIS ONE 🤦🏻 TRY ANOTHER SONG`);
    }

    const cleanLyrics = song.lyrics.plainLyrics;
    
    await m.reply(`*${song.title} - ${song.artist}*\n\n${cleanLyrics}\n\n> 🄵🄴🄴-🅇🄼🄳`);

  } catch (error) {
    console.error(`LYRICS API ERROR: ${error.message}`);
    await m.reply(`CANT GET LYRICS FOR "${text}" SHIT BROKE 🤦🏻`);
  }
};