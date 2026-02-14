const axios = require('axios');

module.exports = {
  name: 'biblesearch',
  aliases: ['searchbible', 'findverse'],
  description: 'Search for Bible verses',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      // Popular verses for quick access
      const popularVerses = [
        { reference: "John 3:16", display: "John 3:16 (For God so loved...)" },
        { reference: "Psalm 23", display: "Psalm 23 (The Lord is my shepherd)" },
        { reference: "Matthew 5:1-12", display: "Matthew 5:1-12 (Beatitudes)" },
        { reference: "Romans 8:28", display: "Romans 8:28 (All things work...)" },
        { reference: "Philippians 4:13", display: "Philippians 4:13 (I can do all...)" },
        { reference: "Jeremiah 29:11", display: "Jeremiah 29:11 (Plans to prosper)" },
        { reference: "1 Corinthians 13", display: "1 Corinthians 13 (Love chapter)" },
        { reference: "Proverbs 3:5-6", display: "Proverbs 3:5-6 (Trust in the Lord)" },
        { reference: "Isaiah 41:10", display: "Isaiah 41:10 (Do not fear)" },
        { reference: "Ephesians 2:8-9", display: "Ephesians 2:8-9 (Saved by grace)" }
      ];

      await client.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

      // Create buttons for popular verses
      const searchButtons = popularVerses.map(verse => ({
        buttonId: `${prefix}bibleverse ${verse.reference.toLowerCase().replace(' ', '')}`,
        buttonText: { displayText: verse.display },
        type: 1
      }));

      // Add back button
      searchButtons.push({
        buttonId: `${prefix}bible`,
        buttonText: { displayText: "🔙 Back to Categories" },
        type: 1
      });

      const message = `🔍 *BIBLE VERSE SEARCH* 🔍\n\n*Popular Verses:*\n\nYou can also type:\n*${prefix}bibleverse [book] [chapter:verse]*\nExample: *${prefix}bibleverse john 3:16*`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: searchButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Bible search error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Search command failed.\nError: ${error.message}`);
    }
  }
};