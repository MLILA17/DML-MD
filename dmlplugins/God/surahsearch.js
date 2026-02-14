module.exports = {
  name: 'surahsearch',
  aliases: ['searchsurah', 'findsurah'],
  description: 'Search for a surah by name or number',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      // Common surahs for quick access
      const popularSurahs = [
        { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", display: "Al-Fatihah (The Opening)" },
        { number: 2, name: "Al-Baqarah", arabic: "البقرة", display: "Al-Baqarah (The Cow)" },
        { number: 3, name: "Ali 'Imran", arabic: "آل عمران", display: "Ali 'Imran" },
        { number: 36, name: "Ya-Sin", arabic: "يس", display: "Ya-Sin (Heart of Quran)" },
        { number: 55, name: "Ar-Rahman", arabic: "الرحمن", display: "Ar-Rahman (Most Merciful)" },
        { number: 67, name: "Al-Mulk", arabic: "الملك", display: "Al-Mulk (Sovereignty)" },
        { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", display: "Al-Ikhlas (Sincerity)" },
        { number: 113, name: "Al-Falaq", arabic: "الفلق", display: "Al-Falaq (Daybreak)" },
        { number: 114, name: "An-Nas", arabic: "الناس", display: "An-Nas (Mankind)" }
      ];

      await client.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

      // Create buttons for popular surahs
      const searchButtons = popularSurahs.map(surah => ({
        buttonId: `${prefix}getsurah ${surah.number}`,
        buttonText: { displayText: `${surah.number}. ${surah.name}` },
        type: 1
      }));

      // Add back button
      searchButtons.push({
        buttonId: `${prefix}surah`,
        buttonText: { displayText: "🔙 Back to Categories" },
        type: 1
      });

      const message = `🔍 *SEARCH QURAN SURAH*\n\nYou can:\n1. Use *${prefix}getsurah [number]* (e.g., ${prefix}getsurah 1)\n2. Click a popular surah below\n3. Or type the surah name/number`;

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
      console.error('Surah search error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Search command failed.\nError: ${error.message}`);
    }
  }
};