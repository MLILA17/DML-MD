const yts = require("yt-search");
const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("Are you mute? Give me a video name. It's not rocket science.");
    if (text.length > 100) return m.reply("Your 'video title' is longer than your attention span. Keep it under 100 characters.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        const searchQuery = `${text} official`;
        const searchResult = await yts(searchQuery);
        const video = searchResult.videos[0];
        if (!video) return m.reply(`Nothing found for "${text}". Your taste is as nonexistent as the results.`);
        const encodedUrl = encodeURIComponent(video.url);
        const response = await fetch(`https://api.ootaizumi.web.id/downloader/youtube?url=${encodedUrl}&format=720`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "application/json" } });
        const data = await response.json();
        if (!data.status || !data.result || !data.result.download) throw new Error('API returned no valid video data.');
        const title = data.result.title || "Untitled";
        const videoUrl = data.result.download;
        const thumbnailUrl = data.result.thumbnail;
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await client.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
                    thumbnailUrl,
                    sourceUrl: video.url,
                    mediaType: 2,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    } catch (error) {
        console.error(`Video error:`, error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        let userMessage = 'Download failed. The universe despises your video choice.';
        if (error.message.includes('API returned')) userMessage = 'The video service rejected the request.';
        await m.reply(`${userMessage}\nError: ${error.message}`);
    }
};