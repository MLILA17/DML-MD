const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    const fetchTikTokData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (
                data &&
                data.status === 200 &&
                data.tiktok &&
                data.tiktok.music
            ) {
                return data;
            }
        }
        throw new Error("Failed to fetch valid TikTok data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide a TikTok link for the audio.");
        if (!text.includes("tiktok.com")) return m.reply("That is not a valid TikTok link.");

        const url = `https://api.dreaded.site/api/tiktok?url=${text}`;
        const data = await fetchTikTokData(url);

        const tikAudioUrl = data.tiktok.music;

        m.reply(`TikTok audio data fetched successfully! Sending. . .`);

        const response = await fetch(tikAudioUrl);

        if (!response.ok) {
            throw new Error(`Failed to download audio: HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: "audio/mpeg",
            ptt: false,
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};