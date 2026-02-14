const axios = require('axios');

module.exports = {
  name: 'getverse',
  aliases: ['ayat', 'verse', 'quranverse'],
  description: 'Get specific verses from a surah',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *getverse [surah] [verse_range]*\nExample: *getverse 1 1-7*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *getverse [surah] [verses]*");

      const surahNumber = parseInt(args[0]);
      const verseRange = args[1];

      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return m.reply("Invalid surah number. Must be between 1 and 114.");
      }

      await client.sendMessage(m.chat, { react: { text: '📜', key: m.key } });

      // Parse verse range
      let startVerse, endVerse;
      if (verseRange.includes('-')) {
        [startVerse, endVerse] = verseRange.split('-').map(v => parseInt(v.trim()));
      } else {
        startVerse = parseInt(verseRange);
        endVerse = startVerse;
      }

      if (isNaN(startVerse) || isNaN(endVerse) || startVerse < 1 || startVerse > endVerse) {
        return m.reply("Invalid verse range format. Use like: 1-7 or 5");
      }

      // Limit verse range for performance
      const MAX_VERSES = 10;
      if (endVerse - startVerse + 1 > MAX_VERSES) {
        endVerse = startVerse + MAX_VERSES - 1;
      }

      // Fetch verses from reliable API
      let versesText = `📜 *Surah ${surahNumber}, Verses ${startVerse}-${endVerse}*\n\n`;
      let versesFound = 0;

      // Try to get verses one by one from reliable API
      for (let verse = startVerse; verse <= endVerse; verse++) {
        try {
          // Use alquran.cloud API which is more reliable
          const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${verse}/editions/quran-uthmani,en.asad`);
          
          if (response.data && response.data.data) {
            const verseData = response.data.data;
            
            // Get Arabic text
            const arabicText = verseData.find(v => v.edition.identifier === 'quran-uthmani')?.text;
            // Get English translation
            const englishText = verseData.find(v => v.edition.identifier === 'en.asad')?.text;
            
            if (arabicText) {
              versesText += `*${verse}.* ${arabicText}\n`;
              if (englishText) {
                versesText += `*Translation:* ${englishText.substring(0, 150)}...\n\n`;
              } else {
                versesText += `*Translation:* Not available\n\n`;
              }
              versesFound++;
            }
          }
        } catch (verseError) {
          // Skip this verse and continue
          continue;
        }
      }

      // If no verses found, use fallback
      if (versesFound === 0) {
        versesText = `📜 *Surah ${surahNumber}, Verses ${startVerse}-${endVerse}*\n\n`;
        versesText += "*Unable to fetch verses at this time.*\n\n";
        versesText += "*Popular verses from Al-Fatihah (Surah 1):*\n\n";
        versesText += "*1.* بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n";
        versesText += "*Translation:* In the name of Allah, the Entirely Merciful, the Especially Merciful.\n\n";
        versesText += "*2.* الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\n";
        versesText += "*Translation:* [All] praise is [due] to Allah, Lord of the worlds.\n\n";
        versesText += "*Please try again later or try a different surah.*";
      }

      // Create navigation buttons
      const verseButtons = [
        {
          buttonId: `${prefix}getsurah ${surahNumber}`,
          buttonText: { displayText: "🔙 Surah Info" },
          type: 1
        }
      ];

      // Add previous/next buttons if applicable
      if (startVerse > 1) {
        const prevStart = Math.max(1, startVerse - MAX_VERSES);
        const prevEnd = Math.max(MAX_VERSES, startVerse - 1);
        verseButtons.push({
          buttonId: `${prefix}getverse ${surahNumber} ${prevStart}-${prevEnd}`,
          buttonText: { displayText: "⬅️ Previous" },
          type: 1
        });
      }

      verseButtons.push({
        buttonId: `${prefix}getverse ${surahNumber} ${endVerse + 1}-${endVerse + MAX_VERSES}`,
        buttonText: { displayText: "➡️ Next" },
        type: 1
      });

      verseButtons.push({
        buttonId: `${prefix}surah`,
        buttonText: { displayText: "🏠 Main Menu" },
        type: 1
      });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Split message if too long
      const maxLength = 4000;
      if (versesText.length > maxLength) {
        versesText = versesText.substring(0, maxLength - 100) + "\n\n... (message truncated)";
      }

      await client.sendMessage(
        m.chat,
        {
          text: versesText,
          footer: '𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘿𝙢𝙡',
          buttons: verseButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Get verse error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      
      // Provide helpful error message
      await m.reply(`📜 *Verse Fetch Failed*\n\nUnable to fetch Quran verses at this time.\n\n*Try these alternatives:*\n1. Use *${prefix}getsurah 1* for Al-Fatihah\n2. Try a different surah number\n3. Check your internet connection\n\nError: ${error.message}`);
    }
  }
};