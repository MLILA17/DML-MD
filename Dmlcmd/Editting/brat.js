const fetch = require('node-fetch');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: 'brat',
    aliases: ['bratsticker', 'brattext'],
    description: 'Makes brat stickers for your attention-seeking ass',
    run: async (context) => {
        const { client, m, prefix } = context;

        const text = m.body.replace(new RegExp(`^${prefix}(brat|bratsticker|brattext)\\s*`, 'i'), '').trim();

        if (!text) {
            return client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ What am I, a mind reader? @${m.sender.split('@')[0]}! You forgot the text, genius. 🤦🏻\n┋❒ Example: ${prefix}brat I'm a dumbass\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const apiUrl = `https://api.nekolabs.web.id/canvas/brat/v1?text=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API says you're not worth the response: ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            const sticker = new Sticker(buffer, {
                pack: 'Your Bratty Demands',
                author: 'DML-MD',
                type: StickerTypes.FULL,
                categories: ['😤', '🤡'],
                quality: 50,
                background: 'transparent'
            });

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(m.chat, await sticker.toMessage(), { quoted: m });

        } catch (error) {
            console.error('Brat command crashed because of you:', error);
            
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = 'Your sticker failed. Shocking.';

            if (error.message.includes('status')) {
                errorMessage = 'API died from cringe. Try again when your text is less stupid.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Your internet is as weak as your personality.';
            } else {
                errorMessage = `Even the error is embarrassed: ${error.message}`;
            }

            await client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ Brat sticker failed, you disappointment.\n┋❒ ${errorMessage}\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
            }, { quoted: m });
        }
    }
};