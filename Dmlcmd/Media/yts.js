const yts = require("yt-search");

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`;
  };

  if (!text) {
    return client.sendMessage(
      m.chat,
      { text: formatStylishReply("Yo, drop a search term, fam! 🔍 Ex: .yts Alan Walker Alone") },
      { quoted: m, ad: true }
    );
  }

  try {
    const searchResult = await yts(text);

    if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
      return client.sendMessage(
        m.chat,
        { text: formatStylishReply("Bruh, no YouTube results found! 😕 Try another search.") },
        { quoted: m, ad: true }
      );
    }

    // Take first 5 results
    const videos = searchResult.videos.slice(0, 5);

    let replyText = `🔎 *YouTube Search Results for:* ${text}\n\n`;

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      replyText += `╭┈┈┈┈━━━━━━┈┈┈┈◈\n`;
      replyText += `🎬 *Title:* ${v.title}\n`;
      replyText += `📎 *Link:* ${v.url}\n`;
      replyText += `👤 *Author:* ${v.author.name} (${v.author.url})\n`;
      replyText += `👁 *Views:* ${v.views.toLocaleString()}\n`;
      replyText += `⏳ *Duration:* ${v.timestamp}\n`;
      replyText += `📅 *Uploaded:* ${v.ago}\n`;
      replyText += `\n`;
    }

    replyText += `╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m, ad: true }
    );

    // Optionally send thumbnail of the first result
    await client.sendMessage(
      m.chat,
      {
        image: { url: videos[0].thumbnail },
        caption: formatStylishReply(`🎬 First result: *${videos[0].title}*\n📎 ${videos[0].url}`),
      },
      { quoted: m }
    );

  } catch (error) {
    await client.sendMessage(
      m.chat,
      { text: formatStylishReply(`Error: ${error.message}`) },
      { quoted: m, ad: true }
    );
  }
};