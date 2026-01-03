module.exports = async (context) => {
  const { client, m, text } = context;
  const yts = require("yt-search");

  const formatStylishReply = (message) => {
    return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`;
  };

  if (!text) {
    return m.reply(formatStylishReply("Yo, dumbass, give me a song name! 🎵 Don’t waste my time."));
  }

  if (text.length > 100) {
    return m.reply(formatStylishReply("What’s this essay, loser? Keep the song name short, max 100 chars."));
  }

  const { videos } = await yts(text);
  if (!videos || videos.length === 0) {
    return m.reply(formatStylishReply("No songs found, you got shit taste. 😕 Try something else."));
  }

  const song = videos[0];
  const title = song.title;
  const artist = song.author?.name || "Unknown Artist";
  const views = song.views?.toLocaleString() || "Unknown";
  const duration = song.duration?.toString() || "Unknown";
  const uploaded = song.ago || "Unknown";
  const thumbnail = song.thumbnail || "";
  const videoUrl = song.url;

  const response = `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
                  `│❒ *${title}* found for ${m.pushName}! 🎶\n` +
                  `│🎤 *Artist*: ${artist}\n` +
                  `│👀 *Views*: ${views}\n` +
                  `│⏱ *Duration*: ${duration}\n` +
                  `│📅 *Uploaded*: ${uploaded}\n` +
                  (thumbnail ? `│🖼 *Thumbnail*: ${thumbnail}\n` : '') +
                  `│🔗 *Video*: ${videoUrl}\n` +
                  `╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
                  `> ©POWERED BY DML-MD`;

  await m.reply(formatStylishReply(response));
};
//DML