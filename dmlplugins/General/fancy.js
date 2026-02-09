/**
 * Fancy Text Generator (API Version)
 * Powered by DML
 */

let fetchFn;
try {
  fetchFn = global.fetch ?? require("node-fetch");
} catch {
  fetchFn = global.fetch;
}

module.exports = {
  name: "fancy",
  aliases: ["styles", "fancytext"],
  description: "Convert text into fancy styles using API",
  category: "Fun",

  run: async (context) => {
    const { client, m, prefix } = context;

    // Safely get text
    const text = m.text?.replace(prefix + "fancy", "").trim();

    // Help menu
    if (!text) {
      const help = `
┏━━━✦ DML • FANCY ✦━━━┓
┃ ✨ Fancy Text Generator
┃
┃ 📌 Usage:
┃   ${prefix}fancy <style> <text>
┃
┃ 🧪 Example:
┃   ${prefix}fancy 1 dml
┗━━━━━━━━━━━━━━━━━━━━┛
`;
      return client.sendMessage(m.chat, { text: help }, { quoted: m });
    }

    const args = text.split(/\s+/);
    const styleNum = Number(args.shift());

    if (!Number.isInteger(styleNum)) {
      return client.sendMessage(
        m.chat,
        { text: `❌ Invalid style number!\nExample: ${prefix}fancy 1 dml` },
        { quoted: m }
      );
    }

    const inputText = args.join(" ");
    if (!inputText) {
      return client.sendMessage(
        m.chat,
        { text: `❌ No text provided!\nExample: ${prefix}fancy ${styleNum} dml` },
        { quoted: m }
      );
    }

    try {
      const url = `https://api.giftedtech.co.ke/api/tools/fancy?apikey=gifted&style=${styleNum}&text=${encodeURIComponent(inputText)}`;

      const res = await fetchFn(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (!data?.result) {
        throw new Error("Invalid API response");
      }

      await client.sendMessage(
        m.chat,
        { text: data.result },
        { quoted: m }
      );

    } catch (err) {
      console.error("Fancy API Error:", err);

      await client.sendMessage(
        m.chat,
        {
          text: `
┏━━━✖ DML • FANCY ✖━━━┓
┃ ⚠️ Fancy Generation Failed
┃
┃ ❌ Could not style text
┃ 🌐 API may be offline
┃
┃ 🔁 Try again later
┗━━━━━━━━━━━━━━━━━━━━┛
`
        },
        { quoted: m }
      );
    }
  }
};
