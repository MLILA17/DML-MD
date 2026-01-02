const fetch = require("node-fetch");
const ytdl = require("ytdl-core");

module.exports = async (context) => {
    const { client, m, text } = context;

    const isValidYouTubeUrl = (url) => {
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?[A-Za-z0-9_-]{11}(\?.*)?$/.test(url);
    };

    if (!text || !isValidYouTubeUrl(text)) {
        return m.reply("That is not a valid YouTube URL. Are you intentionally wasting my time?");
    }

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        const encodedUrl = encodeURIComponent(text);
        const response = await fetch(`https://api.ootaizumi.web.id/downloader/youtube?url=${encodedUrl}&format=720`, { headers: { Accept: "application/json" } });
        const data = await response.json();
        if (!data.status || !data.result || !data.result.download) throw new Error('API returned no valid video data.');
        const title = data.result.title || "No title";
        const thumbnailUrl = data.result.thumbnail || `https://i.ytimg.com/vi/${text.match(/[?&]v=([^&]+)/)?.[1]}/hqdefault.jpg`;
        const videoResponse = await fetch(data.result.download);
        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
                    thumbnailUrl,
                    sourceUrl: text,
                    mediaType: 2,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    } catch (error) {
        console.error("YouTube video error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        try {
            const info = await ytdl.getInfo(text);
            const format = ytdl.chooseFormat(info.formats, { filter: "videoandaudio", quality: "highest" });
            const videoUrl = format.url;
            const title = info.videoDetails.title;
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            await client.sendMessage(m.chat, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                fileName: `${title}.mp4`,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: "©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳 (Fallback)",
                        thumbnailUrl: info.videoDetails.thumbnails[0].url,
                        sourceUrl: text,
                        mediaType: 2,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });
        } catch (fallbackError) {
            console.error(`Fallback error: ${fallbackError.message}`);
            await m.reply(`All download methods failed. Your request is fundamentally broken. Error: ${fallbackError.message}`);
        }
    }
};