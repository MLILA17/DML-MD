const axios = require('axios');

module.exports = async (context) => {
    const { client, m, text } = context;

    // 🔹 TECH / AI STYLE FORMAT
    const formatStylishReply = (message, meta = '') => {
        return `⟦━━━━━━━━━━━━━━⟧
🤖 *WormGPT AI*
${meta ? meta : ''}

${message}

⟦━━━━━━━━━━━━━━⟧
© Powered by DML-MD`;
    };

    // 📌 When no input text is provided
    if (!text) {
        return client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    "Unfiltered AI assistant ready to respond intelligently.\n\n*Example:* `.wormgpt Explain artificial intelligence simply.`"
                )
            },
            { quoted: m, ad: true }
        );
    }

    try {
        const startTime = Date.now();

        // ⏳ Loading reaction
        await client.sendMessage(m.chat, {
            react: { text: '⌛', key: m.key }
        });

        const response = await axios.post(
            "https://zieecantikkk-api.vercel.app/api/wormgpt",
            { text: text },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                timeout: 30000,
            }
        );

        if (!response.data || !response.data.message) {
            throw new Error('Invalid API response');
        }

        const answer = response.data.message.trim();
        const endTime = Date.now();

        // 🧠 META INFO (New Feature)
        const metaInfo = `⏱ ${endTime - startTime} ms  •  📏 ${answer.length} chars`;

        // ✅ Success reaction
        await client.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

        // 📤 Send final response
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(answer, metaInfo)
            },
            { quoted: m, ad: true }
        );

    } catch (error) {
        console.error("WormGPT Error:", error);

        // ❌ Error reaction
        await client.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });

        let errorMessage = "Failed to get response from WormGPT.";

        if (error.response?.status === 404) {
            errorMessage += " API endpoint not found.";
        } else if (error.response?.status === 429) {
            errorMessage += " Rate limit exceeded. Try again later.";
        } else if (error.message.includes("timeout")) {
            errorMessage += " Request timed out.";
        } else if (error.message.includes("ENOTFOUND")) {
            errorMessage += " Cannot connect to API server.";
        } else {
            errorMessage += ` ${error.message}`;
        }

        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(`❌ ${errorMessage}`)
            },
            { quoted: m, ad: true }
        );
    }
};
// DML
