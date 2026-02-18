module.exports = async (context) => {
  const { client, m, text } = context;
  const yts = require("yt-search");

  const box = (title, body) => {
    return `╭━━〔 ${title} 〕━━╮
${body}
╰━━━━━━━━━━━━━━━━╯`;
  };

  if (!text) {
    return m.reply(
      box("🎵 YOUTUBE SEARCH", `
┃ ❌ *Please provide a song name*
┃
┃ ➤ Example:
┃ .song Shape of You
      `)
    );
  }

  if (text.length > 100) {
    return m.reply(
      box("⚠️ LIMIT EXCEEDED", `
┃ ❌ Song name too long
┃ ➤ Maximum: 100 characters
      `)
    );
  }

  try {
    const { videos } = await yts(text);

    if (!videos || videos.length === 0) {
      return m.reply(
        box("🔍 NO RESULTS", `
┃ ❌ No songs found
┃ ➤ Try different keywords
        `)
      );
    }

    const song = videos[0];

    const title = song.title;
    const artist = song.author?.name || "Unknown Artist";
    const views = song.views?.toLocaleString() || "Unknown";
    const duration = song.duration || "Unknown";
    const uploaded = song.ago || "Unknown";
    const videoUrl = song.url;

    let message = `╭━〔 🎶 SONG FOUND 〕━╮
┃ 👤 Requested by: ${m.pushName}
┃
┃ 🏷️ *Title:* ${title}
┃ 🎤 *Artist:* ${artist}
┃ 👀 *Views:* ${views}
┃ ⏱ *Duration:* ${duration}
┃ 📅 *Uploaded:* ${uploaded}
┃ 🔗 *Link:* ${videoUrl}
╰━━━━━━━━━━━━━━━━━╯

✨ Powered by DML-MD`;

    await m.reply(message);

  } catch (error) {
    return m.reply(
      box("⚠️ SYSTEM ERROR", `
┃ ❌ ${error.message}
      `)
    );
  }
};
