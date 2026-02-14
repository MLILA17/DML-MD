const axios = require('axios');

module.exports = {
  name: 'getsurah',
  aliases: ['surahdetail', 'qurandetail'],
  description: 'Get detailed information about a specific surah',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *getsurah [surah_number]*\nExample: *getsurah 1*");

      const surahNumber = parseInt(text.trim());

      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return m.reply("Invalid surah number. Must be between 1 and 114.");
      }

      await client.sendMessage(m.chat, { react: { text: '🕌', key: m.key } });

      // Use multiple API endpoints for reliability
      let surahInfo = null;
      
      // Try API 1: alquran.cloud
      try {
        const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        if (response.data && response.data.data) {
          const data = response.data.data;
          surahInfo = {
            number: data.number,
            name: data.englishName,
            arabicName: data.name,
            englishNameTranslation: data.englishNameTranslation,
            revelationType: data.revelationType,
            numberOfAyahs: data.numberOfAyahs
          };
        }
      } catch (error) {
        console.log('API 1 failed, trying API 2...');
      }

      // Try API 2: quran.com (if first fails)
      if (!surahInfo) {
        try {
          const response = await axios.get(`https://api.quran.com/api/v4/chapters/${surahNumber}`);
          if (response.data && response.data.chapter) {
            const data = response.data.chapter;
            surahInfo = {
              number: data.id,
              name: data.name_simple,
              arabicName: data.name_arabic,
              englishNameTranslation: data.translated_name.name,
              revelationType: data.revelation_place === 'makkah' ? 'Makki' : 'Madani',
              numberOfAyahs: data.verses_count
            };
          }
        } catch (error) {
          console.log('API 2 failed, using fallback data...');
        }
      }

      // Fallback data if all APIs fail
      if (!surahInfo) {
        // Manual data for popular surahs
        const fallbackSurahs = {
          1: { name: "Al-Fatihah", arabicName: "الفاتحة", englishNameTranslation: "The Opening", revelationType: "Makki", numberOfAyahs: 7 },
          2: { name: "Al-Baqarah", arabicName: "البقرة", englishNameTranslation: "The Cow", revelationType: "Madani", numberOfAyahs: 286 },
          3: { name: "Ali 'Imran", arabicName: "آل عمران", englishNameTranslation: "Family of Imran", revelationType: "Madani", numberOfAyahs: 200 },
          36: { name: "Ya-Sin", arabicName: "يس", englishNameTranslation: "Ya Sin", revelationType: "Makki", numberOfAyahs: 83 },
          55: { name: "Ar-Rahman", arabicName: "الرحمن", englishNameTranslation: "The Most Merciful", revelationType: "Madani", numberOfAyahs: 78 },
          67: { name: "Al-Mulk", arabicName: "الملك", englishNameTranslation: "The Sovereignty", revelationType: "Makki", numberOfAyahs: 30 },
          112: { name: "Al-Ikhlas", arabicName: "الإخلاص", englishNameTranslation: "The Sincerity", revelationType: "Makki", numberOfAyahs: 4 },
          113: { name: "Al-Falaq", arabicName: "الفلق", englishNameTranslation: "The Daybreak", revelationType: "Makki", numberOfAyahs: 5 },
          114: { name: "An-Nas", arabicName: "الناس", englishNameTranslation: "Mankind", revelationType: "Makki", numberOfAyahs: 6 }
        };

        surahInfo = fallbackSurahs[surahNumber] || {
          number: surahNumber,
          name: `Surah ${surahNumber}`,
          arabicName: "سورة",
          englishNameTranslation: "Unknown",
          revelationType: "Unknown",
          numberOfAyahs: "Unknown"
        };
      }

      // Format the message (safely)
      const safeSubstring = (str, length) => {
        if (!str || typeof str !== 'string') return "Not available";
        return str.substring(0, Math.min(str.length, length));
      };

      const message = `
🕌 *QURAN SURAH DETAILS* 🕌

*Surah Number:* ${surahInfo.number}
*Arabic Name:* ${surahInfo.arabicName || "Not available"}
*English Name:* ${surahInfo.name || "Not available"}
*Translation:* ${safeSubstring(surahInfo.englishNameTranslation, 50)}
*Revelation Type:* ${surahInfo.revelationType || "Unknown"}
*Total Verses:* ${surahInfo.numberOfAyahs || "Unknown"}

📖 *Description:*
This surah was revealed in ${surahInfo.revelationType === 'Makki' ? 'Mecca' : 'Medina'} and contains ${surahInfo.numberOfAyahs || 'unknown'} verses.

🔗 *𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡*`;

      // Create buttons for additional options
      const surahButtons = [
        {
          buttonId: `${prefix}getverse ${surahNumber} 1-10`,
          buttonText: { displayText: "📜 Read Verses" },
          type: 1
        },
        {
          buttonId: `${prefix}surah ${surahNumber}`,
          buttonText: { displayText: "🔙 Back" },
          type: 1
        },
        {
          buttonId: `${prefix}surah`,
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
          buttons: surahButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Get surah error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      
      // Simple error response
      await m.reply(`🕌 *Surah ${text}*\n\nUnable to fetch detailed information.\nPlease try a different surah number.\n\nError: ${error.message}`);
    }
  }
};