const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`Sticker error: ${error.message}`);
    }
    callback();
}, 1);

module.exports = async (context) => {
    const { client, m, mime, packname, author } = context;

    await client.sendMessage(m.chat, { react: { text: '🔃', key: m.key } });

    commandQueue.push({
        context,
        run: async ({ client, m, mime, packname, author }) => {
            try {
                const quoted = m.quoted ? m.quoted : m;
                const quotedMime = quoted.mimetype || mime || '';

                if (!/image|video/.test(quotedMime)) {
                    return m.reply("Where's the fvcking image or short video idiot.😑");
                }

                if (quoted.videoMessage && quoted.videoMessage.seconds > 30) {
                    return m.reply('Videos must be 30 seconds or shorter.');
                }

                const tempFile = path.join(__dirname, `temp-sticker-${Date.now()}.${/image/.test(quotedMime) ? 'jpg' : 'mp4'}`);
                const media = await client.downloadAndSaveMediaMessage(quoted, tempFile);

                const sticker = new Sticker(media, {
                    pack: packname || 'p',
                    author: author || 'Fredi Ai',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: 50,
                    background: 'transparent'
                });

                const buffer = await sticker.toBuffer();
                await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

                await fs.unlink(tempFile).catch(() => {});
            } catch (error) {
                console.error(`Sticker error: ${error.message}`);
                await m.reply('Error while creating sticker. Try again.');
            }
        }
    });
};
//DML