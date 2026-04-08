const fetch = require("node-fetch");

module.exports = {
  name: "pinterest",
  aliases: ["pin", "pinterestimg"],
  description: "Fetches Pinterest images for your basic needs",
  run: async (context) => {
    const { client, m } = context;

    const formatStylishReply = (message) => {
      return (
        `╭━━〔 *DML PINTEREST* 〕━━⬣\n` +
        `┃ ${message}\n` +
        `╰━━━━━━━━━━━━━━━━━━⬣\n` +
        `> *Powered by DML*`
      );
    };

    try {
      const query = m.text.trim();
      if (!query) {
        return m.reply(
          formatStylishReply(
            "📌 Please provide a search term.\n\nExample:\n.pinterest anime girl"
          )
        );
      }

      await client.sendMessage(m.chat, { react: { text: "⌛", key: m.key } });

      const apiUrl = `https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(query)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.status || !data.result || data.result.length === 0) {
        await client.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return m.reply(
          formatStylishReply(
            `❌ No Pinterest images found for:\n"${query}"`
          )
        );
      }

      const images = data.result.slice(0, 5);
      await client.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

      for (const [i, imgUrl] of images.entries()) {
        try {
          const response = await fetch(imgUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await client.sendMessage(
            m.chat,
            {
              image: buffer,
              caption:
                i === 0
                  ? formatStylishReply(
                      `🖼️ *PINTEREST IMAGE RESULTS*\n\n` +
                      `🔎 *Query:* ${query}\n` +
                      `📚 *Total Sent:* ${images.length}`
                    )
                  : "",
            },
            { quoted: i === 0 ? m : null }
          );

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch {}
      }
    } catch (error) {
      console.error("Pinterest error:", error);
      await client.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      await m.reply(
        formatStylishReply(
          `🚫 Pinterest search failed.\n\nReason: ${error.message}`
        )
      );
    }
  },
};
//DML
