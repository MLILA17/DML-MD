const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) return m.reply("Give me a TikTok link, you attention-deficient simpleton.");
        if (!text.includes("tiktok.com")) return m.reply("That's not a TikTok link. Do you understand what TikTok is?");

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const response = await fetch(`https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`);
        const data = await response.json();

        if (!data?.status || !data?.result?.video?.url) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("TikTok download failed. Your link is probably as useless as the content.");
        }

        const videoUrl = data.result.video.url;
        const videoResponse = await fetch(videoUrl);
        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: "🥀\n—\n🄵🄴🄴-🅇🄼🄳"
        }, { quoted: m });

    } catch (error) {
        console.error("TikTok error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`TikTok download failed. Your video is probably as forgettable as you.\nError: ${error.message}`);
    }
};