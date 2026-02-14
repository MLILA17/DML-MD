const axios = require('axios');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'bible',
  aliases: ['bibleverse', 'scripture', 'biblia'],
  description: 'Get Bible verses with buttons interface',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    const settings = await getSettings();
    const botPrefix = settings.prefix || prefix;

    try {
      // Send initial reaction
      await client.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

      // Bible categories (books grouped by testament)
      const bibleCategories = [
        {
          title: "📘 PENTATEUCH (Genesis-Deuteronomy)",
          description: "First 5 books of Moses",
          books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]
        },
        {
          title: "📗 HISTORICAL BOOKS (Joshua-Esther)",
          description: "History of Israel",
          books: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"]
        },
        {
          title: "📕 WISDOM BOOKS (Job-Song of Solomon)",
          description: "Poetry and wisdom literature",
          books: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"]
        },
        {
          title: "📙 MAJOR PROPHETS (Isaiah-Daniel)",
          description: "Major prophetic books",
          books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"]
        },
        {
          title: "📓 MINOR PROPHETS (Hosea-Malachi)",
          description: "12 minor prophets",
          books: ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]
        },
        {
          title: "✝️ NEW TESTAMENT (Matthew-Revelation)",
          description: "Gospels and Epistles",
          books: ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
        }
      ];

      // Create buttons for first 5 categories (WhatsApp limit)
      const allButtons = [];
      bibleCategories.slice(0, 5).forEach((category, index) => {
        allButtons.push({
          buttonId: `${botPrefix}biblebooks ${index}`,
          buttonText: { displayText: category.title },
          type: 1
        });
      });

      // Add New Testament and search buttons
      allButtons.push({
        buttonId: `${botPrefix}biblebooks 5`,
        buttonText: { displayText: "✝️ NEW TESTAMENT" },
        type: 1
      });

      allButtons.push({
        buttonId: `${botPrefix}biblesearch`,
        buttonText: { displayText: "🔍 Search Verse" },
        type: 1
      });

      const message = `📖 *HOLY BIBLE FINDER* 📖\n\n*Testaments:* Old & New\n*Total Books:* 66\n*Languages:* Multiple translations\n\n*Select a category to browse books:*`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: 'Powered by Dml',
          buttons: allButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Bible command error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Bible command failed.\nError: ${error.message}`);
    }
  }
};