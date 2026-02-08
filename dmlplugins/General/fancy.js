// dml-tech
let fetchFn;
try {
  fetchFn = global.fetch || require("node-fetch");
} catch {
  fetchFn = global.fetch;
}

const CHAT_CACHE = new Map(); // chatId -> { text, results }

module.exports = {
  pattern: "fancy",
  desc: "Convert text into various fonts. Use `.fancy <text>` or `.fancy <n>` after generating.",
  category: "fun",
  react: "🎨",
  filename: __filename,
  use: "fancy <styleNumber?> <text?> or reply to a message",

  execute: async (conn, mek, m, { args, reply, from }) => {
    try {
      if (!fetchFn) return reply("⚠️ Fetch is not available on this runtime.");

      // Extract quoted text if replying
      const getQuotedText = () => {
        const q =
          m?.quoted?.message ||
          mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
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

      // ✅ Safe chat ID
      const chatId = from || m.chat || mek.key?.remoteJid || "global";

      let styleNumber = null;
      let textToConvert = null;
      const quotedText = getQuotedText();

      if (args.length === 0) {
        if (quotedText) textToConvert = quotedText;
        else return reply("❌ Provide text or reply to a message.\nExample: `.fancy Hello`");
      } else {
        if (!isNaN(args[0])) {
          styleNumber = parseInt(args[0], 10);
          if (args.length > 1) textToConvert = args.slice(1).join(" ");
          else if (quotedText) textToConvert = quotedText;
          else {
            const cached = CHAT_CACHE.get(chatId);
            if (cached) textToConvert = cached.text;
            else return reply("❌ No previous text found in this chat. Use `.fancy <text>` first.");
          }
        } else {
          textToConvert = args.join(" ");
        }
      }

      if (!textToConvert) return reply("⚠️ Could not determine text.");

      // === GiftedTech API ===
      const apiUrl = `https://api.giftedtech.co.ke/api/tools/fancy?apikey=gifted&text=${encodeURIComponent(
        textToConvert
      )}`;
      const res = await fetchFn(apiUrl);
      if (!res.ok) return reply("⚠️ Failed to fetch fonts from API.");
      const data = await res.json();

      if (!data || !Array.isArray(data.results)) {
        return reply("⚠️ API returned no fonts.");
      }

      CHAT_CACHE.set(chatId, { text: textToConvert, results: data.results });

      // Safe JID extraction
      const getSafeMentionJid = () => {
        try {
          if (!m.sender) return [];
          const senderParts = m.sender.split('@');
          if (senderParts.length === 2 && senderParts[1] === 's.whatsapp.net') {
            return [`${senderParts[0]}@s.whatsapp.net`];
          }
          return [];
        } catch (e) {
          return [];
        }
      };

      const mentionedJid = getSafeMentionJid();

      if (styleNumber !== null) {
        if (styleNumber < 1 || styleNumber > data.results.length) {
          return reply(`⚠️ Invalid style. Choose between 1 and ${data.results.length}.`);
        }
        const chosen = data.results[styleNumber - 1];

        // Send selected style with contextInfo
        await conn.sendMessage(chatId, {
          text: `🎨 Fancy (${styleNumber} - ${chosen.name}):\n\n${chosen.result}`,
          contextInfo: {
            mentionedJid,
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363403958418756@newsletter',
              newsletterName: 'Dml-tech',
              serverMessageId: 200
            }
          }
        }, { quoted: mek });
        return;
      }

      // Show all options with contextInfo
      let msg = `🎨 *Fancy styles for:* ${textToConvert}\n_Show a style by typing_ \`.fancy <number>\`\n\n`;
      data.results.forEach((f, i) => {
        msg += `*${i + 1}*. ${f.result} (${f.name})\n`;
      });

      await conn.sendMessage(chatId, {
        text: msg,
        contextInfo: {
          mentionedJid,
          forwardingScore: 200,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363403958418756@newsletter',
            newsletterName: 'Dml-tech',
            serverMessageId: 200
          }
        }
      }, { quoted: mek });

    } catch (err) {
      console.error("Error in fancy.js:", err);

      // Error message with contextInfo (safe fallback)
      await conn.sendMessage(from || m.chat || mek.key?.remoteJid, {
        text: "⚠️ Error converting text. Try again later.",
        contextInfo: {
          mentionedJid: [],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363403958418756@newsletter',
            newsletterName: 'Dml-tech',
            serverMessageId: 200
          }
        }
      }, { quoted: mek });
    }
  },
};
