module.exports = async (context) => {
  const { client, m, text, isGroup } = context;

  // Group only command
  if (!isGroup) {
    return m.reply('This command can only be used in groups.');
  }

  try {
    let url;

    // If no character name is provided, get a random quote
    if (!text) {
      url = 'https://animechan.xyz/api/random';
    } else {
      // Get quote by character name
      url = `https://animechan.xyz/api/random/character?name=${encodeURIComponent(text)}`;
    }

    const response = await fetch(url);
    const quote = await response.json();

    if (!quote || quote.error) {
      return m.reply('❌ Quote not found.');
    }

    const message = `╔══════════════════════════╗
║        DML-MD            ║
╚══════════════════════════╝

🎬 Anime: ${quote.anime}
👤 Character: ${quote.character}
💬 Quote:
${quote.quote}

Powered by DML-MD`;

    await m.reply(message);

  } catch (error) {
    console.error(error);
    m.reply('❌ An error occurred while fetching the quote.');
  }
};
