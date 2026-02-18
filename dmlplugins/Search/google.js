module.exports = async (context) => {
  const { client, m, text } = context;
  const axios = require("axios");

  if (!text) {
    return m.reply(`╭━〔 🔎 GOOGLE SEARCH 〕━╮
┃ ❌ *Missing Search Term*
┃
┃ ➤ Example:
┃ .google What is treason
╰━━━━━━━━━━━━━━━━━━━╯`);
  }

  try {
    let { data } = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(text)}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`
    );

    if (!data.items || data.items.length === 0) {
      return m.reply(`╭━〔 🔎 GOOGLE SEARCH 〕━╮
┃ ❌ *No Results Found*
┃
┃ Try using different keywords.
╰━━━━━━━━━━━━━━━━━━━╯`);
    }

    let msg = `╭━〔 🌐 GOOGLE SEARCH RESULT 〕━╮
┃ 🔍 *Query:* ${text}
╰━━━━━━━━━━━━━━━━━━━╯\n\n`;

    data.items.slice(0, 5).forEach((item, index) => {
      msg += `╭─〔 📌 Result ${index + 1} 〕
┃ 🏷️ *Title:* ${item.title}
┃ 📝 *Snippet:* ${item.snippet}
┃ 🔗 *Link:* ${item.link}
╰─────────────────╯\n\n`;
    });

    msg += `✨ Powered by Dml`;

    m.reply(msg);

  } catch (e) {
    m.reply(`╭━〔 ⚠️ SYSTEM ERROR 〕━╮
┃ ❌ ${e.message}
╰━━━━━━━━━━━━━━━━━━━╯`);
  }
};
