const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m } = context;

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const response = await fetch("https://api.nekolabs.web.id/random/nsfwhub/ass");
        
        if (!response.ok) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("API's being a little bitch right now. Try again later, dipshit.");
        }

        const buffer = await response.buffer();

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            image: buffer,
            mimetype: "image/jpeg",
            caption: "There. Happy now, you filthy degenerate? 🍑",
        }, { quoted: m });

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply("Everything fucking broke. Blame your bad luck.");
    }
};