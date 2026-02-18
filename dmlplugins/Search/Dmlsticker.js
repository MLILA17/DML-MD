module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  description: 'Fetch GIF stickers from Tenor using a search term',

  run: async (context) => {
    const { client, m, text, botname } = context;
    const axios = require('axios');
    const { Sticker, StickerTypes } = require('wa-sticker-formatter');

    const box = (title, body) => {
      return `╭━━━〔 ${title} 〕━━━╮
${body}
╰━━━━━━━━━━━━━━━━━━━━╯`;
    };

    try {

      // Validate botname
      if (!botname) {
        console.error('Botname not set.');
        return m.reply(
          box("⚠️ CONFIG ERROR", `
┃ ❌ Bot name is not configured
┃ ➤ Contact bot developer
          `)
        );
      }

      // Validate sender
      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        console.error(`Invalid sender: ${JSON.stringify(m.sender)}`);
        return m.reply(
          box("⚠️ USER ERROR", `
┃ ❌ Unable to detect your number
┃ ➤ Please try again
          `)
        );
      }

      const userNumber = m.sender.split('@')[0];

      // No search term
      if (!text) {
        return m.reply(
          box("🖼️ STICKER SEARCH", `
┃ 👤 @${userNumber}
┃
┃ ❌ Please provide a search term
┃ ➤ Example: .sticker happy
          `),
          { mentions: [m.sender] }
        );
      }

      // Group notice
      if (m.isGroup) {
        await m.reply(
          box("📥 PRIVATE DELIVERY", `
┃ 👤 @${userNumber}
┃
┃ Stickers will be sent to your DM
          `),
          { mentions: [m.sender] }
        );
      }

      const tenorApiKey = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';

      // Fetch GIFs
      const response = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(text)}&key=${tenorApiKey}&client_key=DML_MD&limit=8&media_filter=gif`
      );

      const results = response.data.results;

      if (!results || results.length === 0) {
        return m.reply(
          box("🔍 NO RESULTS", `
┃ ❌ No stickers found for "${text}"
┃ ➤ Try different keywords
          `)
        );
      }

      // Send up to 8 stickers
      for (let i = 0; i < Math.min(8, results.length); i++) {

        const gifUrl = results[i]?.media_formats?.gif?.url;
        if (!gifUrl) continue;

        const sticker = new Sticker(gifUrl, {
          pack: botname,
          author: 'DML-MD',
          type: StickerTypes.FULL,
          categories: ['✨', '🎭'],
          id: `DML-${Date.now()}-${i}`,
          quality: 70,
          background: 'transparent'
        });

        const buffer = await sticker.toBuffer();

        await client.sendMessage(
          m.sender,
          { sticker: buffer },
          { quoted: m }
        );
      }

      // Success message
      await m.reply(
        box("✅ STICKERS SENT", `
┃ 👤 @${userNumber}
┃ 🔍 Search: ${text}
┃ 📦 Sent successfully
        `),
        { mentions: [m.sender] }
      );

    } catch (error) {

      console.error(`Sticker command error: ${error.stack}`);

      return m.reply(
        box("⚠️ SYSTEM ERROR", `
┃ ❌ Failed to fetch stickers
┃ ➤ ${error.message}
        `)
      );
    }
  }
};
