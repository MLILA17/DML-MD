const yts = require("yt-search");

module.exports = async (context) => {
  const { client, m, text } = context;

  // ==========dml =================
  const formatStylishReply = (message) => {
    return `╔═════════════✦✦\n║ ❒ ${message}\n╚════════════✦✦\n➤ ©POWERED BY YOU`;
  };

  const formatVideoBox = (v, index) => {
    return `╔═══════════════✦✦
║ ${index + 1}. 🎬 Title: ${v.title}
║ 👤 Author: ${v.author?.name || "Unknown"} (${v.author?.url || "No URL"})
║ 👁 Views: ${v.views.toLocaleString()}
║ ⏳ Duration: ${v.timestamp}
║ 📅 Uploaded: ${v.ago}
║ 🔗 Link: ${v.url}
╚═══════════════✦✦\n`;
  };
  // ================================================================

  if (!text) {
    return client.sendMessage(
      m.chat,
      { text: formatStylishReply("Hi, drop a search term, fam! 🔍 Ex: .yts Harmonize bye bye") },
      { quoted: m, ad: true }
    );
  }

  try {
    const searchResult = await yts(text);

    if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
      return client.sendMessage(
        m.chat,
        { text: formatStylishReply("Mhhhhh, no YouTube results found! 😕 Try another search.") },
        { quoted: m, ad: true }
      );
    }

    // Take first 5 results
    const videos = searchResult.videos.slice(0, 5);

    let replyText = `🔎 *Dml YouTube Search Results for:* ${text}\n\n`;

    for (let i = 0; i < videos.length; i++) {
      replyText += formatVideoBox(videos[i], i);
    }

    replyText += `➤ End of Results`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m, ad: true }
    );

    // Send thumbnail of the first result with premium style caption
    await client.sendMessage(
      m.chat,
      {
        image: { url: videos[0].thumbnail },
        caption: formatStylishReply(`🎬 First result: ${videos[0].title}\n🔗 ${videos[0].url}`),
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
//dml-md
