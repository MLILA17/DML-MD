/**
 * Fancy Text Generator (API Version)
 * Powered by DML-Tech
 */

let fetchFn;
try {
  fetchFn = global.fetch || require("node-fetch");
} catch {
  fetchFn = global.fetch;
}

const CHAT_CACHE = new Map(); // chatId -> { text, results }

module.exports = {
  name: "fancy",
  aliases: ["styles", "fancytext"],
  description: "Convert text into various fancy fonts",
  category: "General",

  run: async (context) => {
    const { client, m, prefix } = context;

    if (!fetchFn) {
      return client.sendMessage(m.chat, { text: "⚠️ Fetch not supported on this runtime." }, { quoted: m });
    }

    const chatId = m.chat || "global";

    // -------- quoted text extractor --------
    const getQuotedText = () => {
      const q =
        m?.quoted?.message ||
        m?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!q) return null;

      return (
        q.conversation ||
        q.extendedTextMessage?.text ||
        q.imageMessage?.caption ||
        q.videoMessage?.caption ||
        q.documentMessage?.fileName ||
        null
      );
    };

    const rawText = m.text?.replace(prefix + "fancy", "").trim() || "";
    const args = rawText.split(/\s+/).filter(Boolean);
    const quotedText = getQuotedText();

    let styleNumber = null;
    let textToConvert = null;

    // -------- argument logic (MATCHES YOUR WORKING CODE) --------
    if (args.length === 0) {
      if (quotedText) textToConvert = quotedText;
      else {
        return client.sendMessage(
          m.chat,
          { text: `❌ Provide text or reply to a message.\nExample: ${prefix}fancy Hello` },
          { quoted: m }
        );
      }
    } else {
      if (!isNaN(args[0])) {
        styleNumber = parseInt(args[0], 10);

        if (args.length > 1) {
          textToConvert = args.slice(1).join(" ");
        } else if (quotedText) {
          textToConvert = quotedText;
        } else {
          const cached = CHAT_CACHE.get(chatId);
          if (cached) textToConvert = cached.text;
          else {
            return client.sendMessage(
              m.chat,
              { text: `❌ No previous text found.\nUse ${prefix}fancy <text> first.` },
              { quoted: m }
            );
          }
        }
      } else {
        textToConvert = args.join(" ");
      }
    }

    if (!textToConvert) {
      return client.sendMessage(m.chat, { text: "⚠️ Could not determine text." }, { quoted: m });
    }

    try {
      // -------- API CALL (ONLY WHEN NEEDED) --------
      let results;

      const cached = CHAT_CACHE.get(chatId);
      if (!cached || cached.text !== textToConvert) {
        const apiUrl = `https://api.giftedtech.co.ke/api/tools/fancy?apikey=gifted&text=${encodeURIComponent(
          textToConvert
        )}`;

        const res = await fetchFn(apiUrl);
        if (!res.ok) throw new Error("API fetch failed");

        const data = await res.json();
        if (!data || !Array.isArray(data.results)) {
          throw new Error("Invalid API response");
        }

        results = data.results;
        CHAT_CACHE.set(chatId, { text: textToConvert, results });
      } else {
        results = cached.results;
      }

      // -------- STYLE SELECTION --------
      if (styleNumber !== null) {
        if (styleNumber < 1 || styleNumber > results.length) {
          return client.sendMessage(
            m.chat,
            { text: `⚠️ Invalid style.\nChoose between 1 and ${results.length}.` },
            { quoted: m }
          );
        }

        const chosen = results[styleNumber - 1];

        return client.sendMessage(
          m.chat,
          {
            text: `🎨 *Fancy (${styleNumber} - ${chosen.name})*\n\n${chosen.result}`
          },
          { quoted: m }
        );
      }

      // -------- SHOW ALL STYLES --------
      let msg = `🎨 *Fancy styles for:* ${textToConvert}\n`;
      msg += `_Use ${prefix}fancy <number> to select_\n\n`;

      results.forEach((f, i) => {
        msg += `*${i + 1}.* ${f.result} (${f.name})\n`;
      });

      await client.sendMessage(m.chat, { text: msg }, { quoted: m });

    } catch (err) {
      console.error("Fancy Error:", err);
      await client.sendMessage(
        m.chat,
        { text: "⚠️ Error converting text. Please try again later." },
        { quoted: m }
      );
    }
  }
};
