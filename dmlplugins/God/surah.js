const axios = require('axios');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'surah',
  aliases: ['quran', 'ayat', 'surahh', 'qurann'],
  description: 'Get Quran surah information with buttons interface',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    const settings = await getSettings();
    const botPrefix = settings.prefix || prefix;

    try {
      // Send initial reaction
      await client.sendMessage(m.chat, { react: { text: '🕌', key: m.key } });

      // Quran categories (Makki & Madani surahs grouped)
      const quranCategories = [
        {
          title: "📖 MECCAN SURAHS (1-30)",
          description: "Early revelations in Mecca",
          surahRange: "1-30"
        },
        {
          title: "📖 MECCAN SURAHS (31-60)",
          description: "Middle period in Mecca",
          surahRange: "31-60"
        },
        {
          title: "📖 MEDINAN SURAHS (61-90)",
          description: "Revelations in Medina",
          surahRange: "61-90"
        },
        {
          title: "📖 MEDINAN SURAHS (91-114)",
          description: "Final revelations",
          surahRange: "91-114"
        },
        {
          title: "✨ SPECIAL SURAHS",
          description: "Popular and frequently recited",
          specialSurahs: [
            { number: 1, name: "Al-Fatihah", arabic: "الفاتحة" },
            { number: 2, name: "Al-Baqarah", arabic: "البقرة" },
            { number: 36, name: "Ya-Sin", arabic: "يس" },
            { number: 55, name: "Ar-Rahman", arabic: "الرحمن" },
            { number: 67, name: "Al-Mulk", arabic: "الملك" },
            { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص" },
            { number: 113, name: "Al-Falaq", arabic: "الفلق" },
            { number: 114, name: "An-Nas", arabic: "الناس" }
          ]
        }
      ];

      // Create buttons for each category
      const allButtons = [];
      quranCategories.forEach((category, index) => {
        allButtons.push({
          buttonId: `${botPrefix}surahs ${index}`,
          buttonText: { displayText: category.title },
          type: 1
        });
      });

      // Add search button
      allButtons.push({
        buttonId: `${botPrefix}surahsearch`,
        buttonText: { displayText: "🔍 Search Surah" },
        type: 1
      });

      const message = `🕌 *QURAN SURAH FINDER* 🕌\n\n*Total Surahs:* 114\n*Revelation:* Makki (86) & Madani (28)\n\n*Select a category to browse surahs:*`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: allButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Surah command error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Surah command failed.\nError: ${error.message}`);
    }
  }
};