module.exports = {
  name: 'biblemorebooks',
  aliases: ['morebiblebooks'],
  description: 'Show more Bible books from category',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *biblemorebooks [category] [start_index]*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format.");

      const categoryIndex = parseInt(args[0]);
      const startIndex = parseInt(args[1]);

      // Bible categories (same as biblebooks.js)
      const bibleCategories = [
        {
          title: "📘 PENTATEUCH",
          books: [
            { name: "Genesis", chapters: 50, abbreviation: "gen" },
            { name: "Exodus", chapters: 40, abbreviation: "exo" },
            { name: "Leviticus", chapters: 27, abbreviation: "lev" },
            { name: "Numbers", chapters: 36, abbreviation: "num" },
            { name: "Deuteronomy", chapters: 34, abbreviation: "deu" }
          ]
        },
        {
          title: "📗 HISTORICAL BOOKS",
          books: [
            { name: "Joshua", chapters: 24, abbreviation: "jos" },
            { name: "Judges", chapters: 21, abbreviation: "jdg" },
            { name: "Ruth", chapters: 4, abbreviation: "rut" },
            { name: "1 Samuel", chapters: 31, abbreviation: "1sa" },
            { name: "2 Samuel", chapters: 24, abbreviation: "2sa" },
            { name: "1 Kings", chapters: 22, abbreviation: "1ki" },
            { name: "2 Kings", chapters: 25, abbreviation: "2ki" },
            { name: "1 Chronicles", chapters: 29, abbreviation: "1ch" },
            { name: "2 Chronicles", chapters: 36, abbreviation: "2ch" },
            { name: "Ezra", chapters: 10, abbreviation: "ezr" },
            { name: "Nehemiah", chapters: 13, abbreviation: "neh" },
            { name: "Esther", chapters: 10, abbreviation: "est" }
          ]
        },
        {
          title: "📕 WISDOM BOOKS",
          books: [
            { name: "Job", chapters: 42, abbreviation: "job" },
            { name: "Psalms", chapters: 150, abbreviation: "psa" },
            { name: "Proverbs", chapters: 31, abbreviation: "pro" },
            { name: "Ecclesiastes", chapters: 12, abbreviation: "ecc" },
            { name: "Song of Solomon", chapters: 8, abbreviation: "sng" }
          ]
        },
        {
          title: "📙 MAJOR PROPHETS",
          books: [
            { name: "Isaiah", chapters: 66, abbreviation: "isa" },
            { name: "Jeremiah", chapters: 52, abbreviation: "jer" },
            { name: "Lamentations", chapters: 5, abbreviation: "lam" },
            { name: "Ezekiel", chapters: 48, abbreviation: "ezk" },
            { name: "Daniel", chapters: 12, abbreviation: "dan" }
          ]
        },
        {
          title: "📓 MINOR PROPHETS",
          books: [
            { name: "Hosea", chapters: 14, abbreviation: "hos" },
            { name: "Joel", chapters: 3, abbreviation: "jol" },
            { name: "Amos", chapters: 9, abbreviation: "amo" },
            { name: "Obadiah", chapters: 1, abbreviation: "oba" },
            { name: "Jonah", chapters: 4, abbreviation: "jon" },
            { name: "Micah", chapters: 7, abbreviation: "mic" },
            { name: "Nahum", chapters: 3, abbreviation: "nam" },
            { name: "Habakkuk", chapters: 3, abbreviation: "hab" },
            { name: "Zephaniah", chapters: 3, abbreviation: "zep" },
            { name: "Haggai", chapters: 2, abbreviation: "hag" },
            { name: "Zechariah", chapters: 14, abbreviation: "zec" },
            { name: "Malachi", chapters: 4, abbreviation: "mal" }
          ]
        },
        {
          title: "✝️ NEW TESTAMENT",
          books: [
            { name: "Matthew", chapters: 28, abbreviation: "mat" },
            { name: "Mark", chapters: 16, abbreviation: "mrk" },
            { name: "Luke", chapters: 24, abbreviation: "luk" },
            { name: "John", chapters: 21, abbreviation: "jhn" },
            { name: "Acts", chapters: 28, abbreviation: "act" },
            { name: "Romans", chapters: 16, abbreviation: "rom" },
            { name: "1 Corinthians", chapters: 16, abbreviation: "1co" },
            { name: "2 Corinthians", chapters: 13, abbreviation: "2co" },
            { name: "Galatians", chapters: 6, abbreviation: "gal" },
            { name: "Ephesians", chapters: 6, abbreviation: "eph" },
            { name: "Philippians", chapters: 4, abbreviation: "php" },
            { name: "Colossians", chapters: 4, abbreviation: "col" },
            { name: "1 Thessalonians", chapters: 5, abbreviation: "1th" },
            { name: "2 Thessalonians", chapters: 3, abbreviation: "2th" },
            { name: "1 Timothy", chapters: 6, abbreviation: "1ti" },
            { name: "2 Timothy", chapters: 4, abbreviation: "2ti" },
            { name: "Titus", chapters: 3, abbreviation: "tit" },
            { name: "Philemon", chapters: 1, abbreviation: "phm" },
            { name: "Hebrews", chapters: 13, abbreviation: "heb" },
            { name: "James", chapters: 5, abbreviation: "jas" },
            { name: "1 Peter", chapters: 5, abbreviation: "1pe" },
            { name: "2 Peter", chapters: 3, abbreviation: "2pe" },
            { name: "1 John", chapters: 5, abbreviation: "1jn" },
            { name: "2 John", chapters: 1, abbreviation: "2jn" },
            { name: "3 John", chapters: 1, abbreviation: "3jn" },
            { name: "Jude", chapters: 1, abbreviation: "jud" },
            { name: "Revelation", chapters: 22, abbreviation: "rev" }
          ]
        }
      ];

      if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= bibleCategories.length) {
        return m.reply("Invalid category number.");
      }

      const category = bibleCategories[categoryIndex];
      const books = category.books.slice(startIndex, startIndex + 10);

      if (books.length === 0) {
        return m.reply("No more books in this category.");
      }

      await client.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

      // Create buttons for books
      const bookButtons = books.map(book => ({
        buttonId: `${prefix}bibleverse ${book.abbreviation} 1`,
        buttonText: { displayText: `${book.name}` },
        type: 1
      }));

      // Add navigation buttons
      if (startIndex + 10 < category.books.length) {
        bookButtons.push({
          buttonId: `${prefix}biblemorebooks ${categoryIndex} ${startIndex + 10}`,
          buttonText: { displayText: "⏭️ More Books" },
          type: 1
        });
      }

      bookButtons.push({
        buttonId: `${prefix}biblebooks ${categoryIndex}`,
        buttonText: { displayText: "🔙 Back to First" },
        type: 1
      });

      bookButtons.push({
        buttonId: `${prefix}bible`,
        buttonText: { displayText: "🏠 Main Menu" },
        type: 1
      });

      const message = `📖 *${category.title} (More Books)*\n\nSelect a book:`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: bookButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('More books error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Failed to show more books.\nError: ${error.message}`);
    }
  }
};