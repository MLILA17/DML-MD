const fs = require("fs");
const path = require("path");
const axios = require("axios");

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const isValidYouTubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?[A-Za-z0-9_-]{11}(\?.*)?$/.test(url);
};

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `┌─〔 SYSTEM OUTPUT 〕─┐
│ ▸ ${message}
└────────────────────┘
[ POWERED BY :: YOU ]
`;
  };

  if (!text || !isValidYouTubeUrl(text)) {
    return client.sendMessage(
      m.chat,
      { text: formatStylishReply("Yo, drop a valid YouTube URL, fam! 🎵 Ex: .yt https://youtu.be/60ItHLz5WEA") },
      { quoted: m, ad: true }
    );
  }

  try {
    const timestamp = Date.now();
    const fileName = `audio_${timestamp}.mp3`;
    const filePath = path.join(tempDir, fileName);

    const thumbnailUrl = `https://i.ytimg.com/vi/${text.match(/[?&]v=([^&]+)/)?.[1]}/hqdefault.jpg` || "https://via.placeholder.com/120x90";

    await client.sendMessage(
      m.chat,
      { text: formatStylishReply("Grabbin’ the audio for ya, fam! Crank it up! 🔥🎶") },
      { quoted: m, ad: true }
    );

    const apiUrl = `https://ytdownloader-aie4qa.fly.dev/download/audio?song=${encodeURIComponent(text)}&quality=128K&cb=${timestamp}`;
    const response = await axios({
      method: "get",
      url: apiUrl,
      responseType: "stream",
      timeout: 600000,
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      throw new Error("Audio download failed or file is empty");
    }

    await client.sendMessage(
      m.chat,
      {
        audio: { url: filePath },
        mimetype: "audio/mpeg",
        fileName: `song.mp3`,
        contextInfo: {
          externalAdReply: {
            title: "YouTube Audio",
            body: "Quality: 128K | ©POWERED BY YOU",
            thumbnailUrl,
            sourceUrl: text,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m, ad: true }
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    await client.sendMessage(
      m.chat,
      { text: formatStylishReply(`Hi, we hit a snag: ${error.message}. Check the URL and try again! 😎`) },
      { quoted: m, ad: true }
    );
  }
};
