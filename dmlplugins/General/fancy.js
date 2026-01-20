const fetch = require('node-fetch');

const GOOGLE_FONTS_API_KEY = 'AIzaSyDIjr73rt-xbCKiuW2vxYLoDDSr9BYeNVM';

module.exports = {
    name: 'fancy',
    aliases: ['fancytext', 'style', 'stylish'],
    description: 'Shows all available fancy font styles from Google Fonts',
    run: async (context) => {
        const { client, m, prefix } = context;

        // React to show it's loading
        await client.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        try {
            // Fetch Google Fonts list
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                return m.reply("Couldn't fetch fonts. Google API is sad 😢");
            }

            // Limit to first 50 fonts for readability
            const fonts = data.items.slice(0, 50);

            let msg = `*FANCY FONT MENU* 🔥\n\n`;
            msg += `Found *${fonts.length}* styles. Pick one by replying with:\n`;
            msg += `*${prefix}fancy<number> your text*\n\n`;
            msg += `Example: ${prefix}fancy1 DML-XMD\n`;
            msg += `Example: ${prefix}fancy42 Hello\n\n`;
            msg += `──────────────────\n\n`;

            fonts.forEach((font, i) => {
                msg += `*${i + 1}.* ${font.family}\n`;
            });

            msg += `\n> Powered by 𝙳𝙼𝙻-𝚇𝙼𝙳 💀`;

            await client.sendMessage(m.chat, { text: msg }, { quoted: m });

        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            console.error(error);
            m.reply("Failed to load fonts. Google API is probably crying. Try later.");
        }
    }
};
