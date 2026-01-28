const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("You dumb fuck, type something. I'm not psychic.");
    if (text.length > 150) return m.reply("Your search is longer than your dick. Keep it under 150 chars, idiot.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const searchQuery = encodeURIComponent(text.trim());
        const searchResponse = await fetch(`https://api.nekolabs.web.id/discovery/xvideos/search?q=${searchQuery}`);
        const searchData = await searchResponse.json();

        if (!searchData.success || !searchData.result || searchData.result.length === 0) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`Couldn't find shit for "${text}". Try better keywords, retard.`);
        }

        const firstVideo = searchData.result[0];
        const videoPageUrl = firstVideo.url;
        const videoTitle = firstVideo.title || "Some Crappy Clip";
        const duration = firstVideo.duration || "??";
        const cleanTitle = `\( {videoTitle.replace(/[^a-zA-Z0-9]/g, "_")}__ \){duration.replace(/[^a-zA-Z0-9]/g, "")}`;

        const encodedVideoUrl = encodeURIComponent(videoPageUrl);
        const downloadResponse = await fetch(`https://api.nekolabs.web.id/downloader/xvideos?url=${encodedVideoUrl}`);
        const downloadData = await downloadResponse.json();

        if (!downloadData.success || !downloadData.result || !downloadData.result.videos) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("Found it but can't download. Site's being a bitch again. Deal with it.");
        }

        let videoDownloadUrl = downloadData.result.videos.high || downloadData.result.videos.low;
        if (!videoDownloadUrl) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("No proper MP4 link. Only shitty HLS. Cry about it.");
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            video: { url: videoDownloadUrl },
            mimetype: "video/mp4",
            fileName: `${cleanTitle}.mp4`,
            caption: `*${videoTitle}*\n⏱ ${duration}\n\nGo jerk off somewhere else.`,
            contextInfo: {
                externalAdReply: {
                    title: videoTitle.length > 80 ? videoTitle.substring(0, 77) + "..." : videoTitle,
                    body: "Suck it up • Edu purposes my ass",
                    thumbnailUrl: downloadData.result.thumb || firstVideo.cover,
                    sourceUrl: videoPageUrl,
                    mediaType: 2,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`Everything broke because you're cursed.\nFix your life.`);
    }
};