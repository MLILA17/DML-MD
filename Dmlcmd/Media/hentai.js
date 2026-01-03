const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`;
    };

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`API failed with status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries || error.type !== "request-timeout") {
                    throw error;
                }
                console.error(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    if (!text) {
        return m.reply(formatStylishReply("Yo, drop a search query, fam! 🔍 Ex: .hentai hinata"));
    }

    try {
        // Step 1: Search using thehentai-search API
        const encodedQuery = encodeURIComponent(text);
        const searchResponse = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/anime/thehentai-search?query=${encodedQuery}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const searchData = await searchResponse.json();

        // Validate search response
        if (!searchData || !searchData.status || !searchData.data || !searchData.data.posts || searchData.data.posts.length === 0) {
            return m.reply(formatStylishReply("No results found for your query, fam! 😢 Try a different search term."));
        }

        // Get the first result's URL
        const firstResult = searchData.data.posts[0];
        const contentUrl = firstResult.url;
        const title = firstResult.title || "No title available";
        const thumbnail = firstResult.imgSrc || null;
        const views = firstResult.views || "Unknown";
        const date = firstResult.date || "Unknown";

        // Step 2: Fetch gallery using thehentai-download API
        const encodedContentUrl = encodeURIComponent(contentUrl);
        const downloadResponse = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/anime/thehentai-download?url=${encodedContentUrl}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const downloadData = await downloadResponse.json();

        // Validate download response
        if (!downloadData || !downloadData.status || !downloadData.data || !downloadData.data.gallery || downloadData.data.gallery.length === 0) {
            return m.reply(formatStylishReply("Couldn’t fetch the gallery for this content, fam! 😢 Try again later."));
        }

        const gallery = downloadData.data.gallery;
        const description = downloadData.data.description || "No description available";

        // Send gallery images
        for (const image of gallery) {
            await client.sendMessage(
                m.chat,
                {
                    image: { url: image.imgSrc },
                    caption: formatStylishReply(
                        `🎨 Hentai Content\n\n📌 *Title:* ${title}\n📝 *Description:* ${description}\n👀 *Views:* ${views}\n📅 *Date:* ${date}\n🖼️ *Image:* ${image.alt}`
                    ),
                },
                { quoted: m }
            );
        }

    } catch (e) {
        console.error("Hentai fetch error:", e);
        m.reply(formatStylishReply(`Yo, we hit a snag: ${e.message}. Check your query and try again! 😎`));
    }
};