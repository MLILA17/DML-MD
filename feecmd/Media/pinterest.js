const fetch = require("node-fetch");

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pinterestimg'],
  description: 'Fetches Pinterest images for your basic needs',
  run: async (context) => {
    const { client, m } = context;

    try {
      const query = m.text.trim();
      if (!query) return m.reply("Give me a search term, you visually impaired fool.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      const apiUrl = `https://api-faa.my.id/faa/pinterest?q=${encodeURIComponent(query)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.status || !data.result || data.result.length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No Pinterest images found for "${query}". Your search is as pointless as you are.`);
      }

      const images = data.result.slice(0, 5);
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      for (const [i, imgUrl] of images.entries()) {
        try {
          const response = await fetch(imgUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await client.sendMessage(m.chat, {
            image: buffer,
            caption: i === 0 ? `🥀\n—\n🄵🄴🄴-🅇🄼🄳\nQuery: ${query}` : ''
          }, { quoted: i === 0 ? m : null });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch {}
      }

    } catch (error) {
      console.error('Pinterest error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Pinterest search failed. Your query is probably as terrible as your taste.\nError: ${error.message}`);
    }
  }
};