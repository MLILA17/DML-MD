const fetch = require('node-fetch');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: 'brat',
    aliases: ['bratsticker', 'brattext'],
    description: 'Generate stylish brat text stickers',

    run: async (context) => {
        const { client, m, prefix } = context;

        const text = m.body
            .replace(new RegExp(`^${prefix}(brat|bratsticker|brattext)\\s*`, 'i'), '')
            .trim();

        const box = (title, body) => {
            return `╭━━〔 ${title} 〕━━╮
${body}
╰━━━━━━━━━━━━━━━━━━╯`;
        };

        if (!text) {
            return client.sendMessage(
                m.chat,
                {
                    text: box(" BRAT STICKER", `
┃ 👤 @${m.sender.split('@')[0]}
┃
┃ ❌ You forgot the text
┃ ➤ Example:
┃ ${prefix}brat I'm unstoppable
                    `),
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        try {
            // Loading reaction
            await client.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
            });

            const apiUrl = `https://api.nekolabs.web.id/canvas/brat?text=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const imageBuffer = await response.buffer();

            if (!imageBuffer || imageBuffer.length < 1000) {
                throw new Error('Invalid image received');
            }

            const sticker = new Sticker(imageBuffer, {
                pack: 'BRAT MODE',
                author: 'DML-MD',
                type: StickerTypes.FULL,
                categories: ['😈', '🔥'],
                quality: 60,
                background: 'transparent'
            });

            const stickerBuffer = await sticker.toBuffer();

            // Success reaction
            await client.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

            await client.sendMessage(
                m.chat,
                { sticker: stickerBuffer },
                { quoted: m }
            );

        } catch (error) {
            console.error('Brat command error:', error);

            await client.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });

            let errorMsg = "Sticker generation failed. Please try again.";

            if (error.message.includes('API')) {
                errorMsg = "Sticker API is currently unavailable.";
            } else if (error.message.includes('Network')) {
                errorMsg = "Network issue detected. Check connection.";
            }

            await client.sendMessage(
                m.chat,
                {
                    text: box("⚠️ BRAT ERROR", `
┃ ❌ ${errorMsg}
                    `)
                },
                { quoted: m }
            );
        }
    }
};
