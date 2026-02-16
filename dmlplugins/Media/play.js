module.exports = {
  name: 'play',
  aliases: ['ytmp3', 'ytmp3doc', 'audiodoc', 'yta'],
  description: 'Download Video from YouTube and send audio',

  run: async (context) => {
    const { client, m } = context;
    const axios = require("axios");

    try {
      const q = (m.text || "").trim();

      if (!q) {
        return m.reply(
          "🎵 *YouTube Audio Downloader*\n\nUsage: play [song name or YouTube link]\n\nExample:\n• play calm down\n• play https://youtu.be/..."
        );
      }

      await client.sendMessage(m.chat, {
        react: { text: "🎵", key: m.key }
      });

      await m.reply(`🔍 Searching and processing: *${q}*...`);

      let videoUrl;
      let videoTitle;
      let videoThumbnail;

      // 🔗 If YouTube link
      if (/(youtube\.com|youtu\.be)/i.test(q)) {
        videoUrl = q;

        const videoId = q.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
        )?.[1];

        if (!videoId) {
          return m.reply("❌ Invalid YouTube URL");
        }

        videoTitle = "YouTube Audio";
        videoThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      } else {
        // 🔍 Search YouTube
        const searchRes = await axios.get(
          `https://api.sidycoders.xyz/api/ytdl?url=${encodeURIComponent()}`
        );

        const videos = searchRes.data?.result;
        if (!Array.isArray(videos) || videos.length === 0) {
          return m.reply("❌ No videos found for your search");
        }

        const firstVideo = videos[0];
        videoUrl = firstVideo.url;
        videoTitle = firstVideo.title;
        videoThumbnail = firstVideo.thumbnail;
      }

      // ⬇️ Download audio
      const downloadRes = await axios.get(
        `https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(videoUrl)}`
      );

      const downloadUrl = downloadRes.data?.result;
      if (!downloadUrl) {
        return m.reply("❌ Failed to get download URL");
      }

      const fileName = `${videoTitle}.mp3`.replace(/[^\w\s.-]/gi, "");

      const contextInfo = {
        externalAdReply: {
          title: videoTitle,
          body: "Powered by Dml",
          mediaType: 1,
          sourceUrl: videoUrl,
          thumbnailUrl: videoThumbnail,
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
      };

      // 🎧 Send audio
      await client.sendMessage(
        m.chat,
        {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName,
          ptt: false,
          contextInfo
        },
        { quoted: m }
      );

      // 📄 Send document version
      await client.sendMessage(
        m.chat,
        {
          document: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName,
          contextInfo: {
            externalAdReply: {
              ...contextInfo.externalAdReply,
              body: "Document version - Powered by Dml"
            }
          }
        },
        { quoted: m }
      );

      console.log(`✅ Sent audio: ${videoTitle}`);

    } catch (error) {
      console.error("❌ Play command error:", error);

      if (error.code === "ECONNABORTED") {
        await m.reply("❌ Request timeout. Please try again.");
      } else {
        await m.reply("❌ API error. Please try another song or check your link.");
      }
    }
  }
};
