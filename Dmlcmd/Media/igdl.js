const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) return m.reply("Give me an Instagram link, you social media addict.");
        if (!text.includes("instagram.com")) return m.reply("That's not an Instagram link. Are your eyes broken?");

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const apiUrl = `https://api.fikmydomainsz.xyz/download/instagram?url=${encodedUrl}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.result?.[0]?.url_download) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("Instagram download failed. The post is probably private or your link is garbage.");
        }

        const igVideoUrl = data.result[0].url_download;

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            video: { url: igVideoUrl },
            mimetype: "video/mp4",
            caption: "🥀\n—\n🄵🄴🄴-🅇🄼🄳",
            gifPlayback: false,
        }, { quoted: m });

    } catch (error) {
        console.error("Instagram error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Instagram download failed. Your link is probably as worthless as you are.\nError: ${error.message}`);
    }
};