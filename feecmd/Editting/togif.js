const axios = require("axios");

module.exports = async (context) => {
  const { client, m, text } = context;

  try {
    // Ensure user gave an emoji
    if (!text) {
      return m.reply("😅 Please provide an emoji to animate!\nExample: `.togif 😂`");
    }

    // Validate it's an emoji
    if (!/\p{Emoji}/u.test(text)) {
      return m.reply("⚠️ That doesn’t look like an emoji. Try again with a real one!");
    }

    await m.reply("🎬 Generating your animated emoji...");

    // Fetch the GIF from the API
    const apiUrl = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(text)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Send the GIF to the chat
    await client.sendMessage(
      m.chat,
      {
        video: Buffer.from(response.data),
        gifPlayback: true,
        caption: `✨ *Animated Emoji: ${text}*\n\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("togif command error:", error);
    await m.reply(`❌ Failed to create emoji GIF: ${error.message}`);
  }
};