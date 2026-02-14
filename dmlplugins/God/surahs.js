const axios = require('axios');

module.exports = {
  name: 'surahs',
  aliases: ['surahlists', 'quranlist'],
  description: 'Show surahs in selected category',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *surahs [category_number]*");

      const categoryIndex = parseInt(text.trim());

      // Quran categories with surah lists
      const quranCategories = [
        {
          title: "📖 MECCAN SURAHS (1-30)",
          surahs: [
            { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", verses: 7 },
            { number: 6, name: "Al-An'am", arabic: "الأنعام", verses: 165 },
            { number: 10, name: "Yunus", arabic: "يونس", verses: 109 },
            { number: 12, name: "Yusuf", arabic: "يوسف", verses: 111 },
            { number: 16, name: "An-Nahl", arabic: "النحل", verses: 128 },
            { number: 18, name: "Al-Kahf", arabic: "الكهف", verses: 110 },
            { number: 21, name: "Al-Anbiya", arabic: "الأنبياء", verses: 112 },
            { number: 25, name: "Al-Furqan", arabic: "الفرقان", verses: 77 },
            { number: 29, name: "Al-Ankabut", arabic: "العنكبوت", verses: 69 },
            { number: 30, name: "Ar-Rum", arabic: "الروم", verses: 60 }
          ]
        },
        {
          title: "📖 MECCAN SURAHS (31-60)",
          surahs: [
            { number: 31, name: "Luqman", arabic: "لقمان", verses: 34 },
            { number: 36, name: "Ya-Sin", arabic: "يس", verses: 83 },
            { number: 39, name: "Az-Zumar", arabic: "الزمر", verses: 75 },
            { number: 40, name: "Ghafir", arabic: "غافر", verses: 85 },
            { number: 41, name: "Fussilat", arabic: "فصلت", verses: 54 },
            { number: 46, name: "Al-Ahqaf", arabic: "الأحقاف", verses: 35 },
            { number: 50, name: "Qaf", arabic: "ق", verses: 45 },
            { number: 54, name: "Al-Qamar", arabic: "القمر", verses: 55 },
            { number: 56, name: "Al-Waqi'ah", arabic: "الواقعة", verses: 96 },
            { number: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", verses: 13 }
          ]
        },
        {
          title: "📖 MEDINAN SURAHS (61-90)",
          surahs: [
            { number: 2, name: "Al-Baqarah", arabic: "البقرة", verses: 286 },
            { number: 3, name: "Ali 'Imran", arabic: "آل عمران", verses: 200 },
            { number: 4, name: "An-Nisa", arabic: "النساء", verses: 176 },
            { number: 5, name: "Al-Ma'idah", arabic: "المائدة", verses: 120 },
            { number: 8, name: "Al-Anfal", arabic: "الأنفال", verses: 75 },
            { number: 9, name: "At-Tawbah", arabic: "التوبة", verses: 129 },
            { number: 22, name: "Al-Hajj", arabic: "الحج", verses: 78 },
            { number: 24, name: "An-Nur", arabic: "النور", verses: 64 },
            { number: 33, name: "Al-Ahzab", arabic: "الأحزاب", verses: 73 },
            { number: 47, name: "Muhammad", arabic: "محمد", verses: 38 }
          ]
        },
        {
          title: "📖 MEDINAN SURAHS (91-114)",
          surahs: [
            { number: 62, name: "Al-Jumu'ah", arabic: "الجمعة", verses: 11 },
            { number: 63, name: "Al-Munafiqun", arabic: "المنافقون", verses: 11 },
            { number: 65, name: "At-Talaq", arabic: "الطلاق", verses: 12 },
            { number: 66, name: "At-Tahrim", arabic: "التحريم", verses: 12 },
            { number: 76, name: "Al-Insan", arabic: "الإنسان", verses: 31 },
            { number: 98, name: "Al-Bayyinah", arabic: "البينة", verses: 8 },
            { number: 110, name: "An-Nasr", arabic: "النصر", verses: 3 },
            { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", verses: 4 },
            { number: 113, name: "Al-Falaq", arabic: "الفلق", verses: 5 },
            { number: 114, name: "An-Nas", arabic: "الناس", verses: 6 }
          ]
        },
        {
          title: "✨ SPECIAL SURAHS",
          surahs: [
            { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", verses: 7, special: "The Opening" },
            { number: 2, name: "Al-Baqarah", arabic: "البقرة", verses: 286, special: "Longest Surah" },
            { number: 36, name: "Ya-Sin", arabic: "يس", verses: 83, special: "Heart of Quran" },
            { number: 55, name: "Ar-Rahman", arabic: "الرحمن", verses: 78, special: "Most Beautiful" },
            { number: 67, name: "Al-Mulk", arabic: "الملك", verses: 30, special: "Protection" },
            { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", verses: 4, special: "Monotheism" },
            { number: 113, name: "Al-Falaq", arabic: "الفلق", verses: 5, special: "Daybreak" },
            { number: 114, name: "An-Nas", arabic: "الناس", verses: 6, special: "Mankind" }
          ]
        }
      ];

      if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= quranCategories.length) {
        return m.reply("Invalid category number.");
      }

      const category = quranCategories[categoryIndex];

      await client.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

      // Create buttons for surahs (maximum 10 per page due to WhatsApp limit)
      const surahButtons = category.surahs.map(surah => ({
        buttonId: `${prefix}getsurah ${surah.number}`,
        buttonText: { displayText: `${surah.number}. ${surah.name}` },
        type: 1
      }));

      // Add navigation buttons
      surahButtons.push({
        buttonId: `${prefix}surah`,
        buttonText: { displayText: "🔙 Back to Categories" },
        type: 1
      });

      // Format surah list text
      let surahListText = "";
      category.surahs.forEach(surah => {
        const specialNote = surah.special ? ` [${surah.special}]` : '';
        surahListText += `*${surah.number}.* ${surah.arabic} - ${surah.name} (${surah.verses} verses)${specialNote}\n`;
      });

      const message = `📖 *${category.title}*\n\n${surahListText}\n*Select a surah:*`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: surahButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Surah list error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Failed to show surah list.\nError: ${error.message}`);
    }
  }
};