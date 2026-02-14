const axios = require('axios');

module.exports = {
  name: 'bibleverse',
  aliases: ['verse', 'scripture', 'bibletext'],
  description: 'Get Bible verses from specific book and chapter',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *bibleverse [book] [chapter]*\nExample: *bibleverse john 3:16*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *bibleverse [book] [chapter:verse]*");

      const book = args[0].toLowerCase();
      const chapterVerse = args.slice(1).join(' ');

      await client.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

      // Build API URL
      const apiUrl = `https://bible-api.com/${book} ${chapterVerse}`;

      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.reference) {
        throw new Error('Invalid Bible reference');
      }

      const data = response.data;

      // Format the message
      const message = `
📖 *HOLY BIBLE* 📖

*Reference:* ${data.reference}
*Translation:* ${data.translation_name}
*Number of Verses:* ${data.verses.length}

*Scripture:*
${data.text.substring(0, 1500)}${data.text.length > 1500 ? '...' : ''}

🔗 *𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡*`;

      // Create navigation buttons
      const verseButtons = [
        {
          buttonId: `${prefix}bibleverse ${book} ${getNextChapter(chapterVerse)}`,
          buttonText: { displayText: "➡️ Next Chapter" },
          type: 1
        },
        {
          buttonId: `${prefix}biblebooks ${getCategoryIndex(book)}`,
          buttonText: { displayText: "🔙 Back to Books" },
          type: 1
        },
        {
          buttonId: `${prefix}bible`,
          buttonText: { displayText: "🏠 Main Menu" },
          type: 1
        }
      ];

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: verseButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Bible verse error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      // Provide helpful examples
      const examples = `
📖 *Bible Verse Examples:*

• *${prefix}bibleverse john 3:16* - Most famous verse
• *${prefix}bibleverse psalm 23* - The Shepherd's Psalm
• *${prefix}bibleverse matthew 5:1-12* - Beatitudes
• *${prefix}bibleverse romans 8:28* - All things work together

*Error:* ${error.message}
`;
      await m.reply(examples);
    }
  }
};

// Helper function to get next chapter
function getNextChapter(chapterVerse) {
  const match = chapterVerse.match(/(\d+)/);
  if (match) {
    const chapter = parseInt(match[1]);
    return `${chapter + 1}`;
  }
  return "1";
}

// Helper function to get category index for a book
function getCategoryIndex(bookAbbr) {
  const bookCategories = {
    'gen': 0, 'exo': 0, 'lev': 0, 'num': 0, 'deu': 0,
    'jos': 1, 'jdg': 1, 'rut': 1, '1sa': 1, '2sa': 1, '1ki': 1, '2ki': 1, '1ch': 1, '2ch': 1, 'ezr': 1, 'neh': 1, 'est': 1,
    'job': 2, 'psa': 2, 'pro': 2, 'ecc': 2, 'sng': 2,
    'isa': 3, 'jer': 3, 'lam': 3, 'ezk': 3, 'dan': 3,
    'hos': 4, 'jol': 4, 'amo': 4, 'oba': 4, 'jon': 4, 'mic': 4, 'nam': 4, 'hab': 4, 'zep': 4, 'hag': 4, 'zec': 4, 'mal': 4,
    'mat': 5, 'mrk': 5, 'luk': 5, 'jhn': 5, 'act': 5, 'rom': 5, '1co': 5, '2co': 5, 'gal': 5, 'eph': 5, 'php': 5, 'col': 5,
    '1th': 5, '2th': 5, '1ti': 5, '2ti': 5, 'tit': 5, 'phm': 5, 'heb': 5, 'jas': 5, '1pe': 5, '2pe': 5, '1jn': 5, '2jn': 5,
    '3jn': 5, 'jud': 5, 'rev': 5
  };

  return bookCategories[bookAbbr] || 5; // Default to New Testament
}