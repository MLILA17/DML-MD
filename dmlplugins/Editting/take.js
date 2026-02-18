const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (err) {
        console.error('WatermarkSticker Queue Error:', err.message);
    }
    callback();
}, 1); // Process one at a time

module.exports = async (context) => {
    const { client, m, mime, pushname } = context;

    const box = (title, body) => {
        return `╭━━━〔 ${title} 〕━━━╮
${body}
╰━━━━━━━━━━━━━━━━━━━━╯`;
    };

    // 🔒 Owner Only
    if (!m.sender.includes('your-owner-number@s.whatsapp.net')) {
        return m.reply(
            box("🔐 OWNER ONLY", `
┃ ❌ This command is restricted
┃ ➤ Only bot owner can use it
            `)
        );
    }

    commandQueue.push({
        context,
        run: async ({ client, m, mime, pushname }) => {

            try {

                if (!m.quoted) {
                    return m.reply(
                        box("📌 WATERMARK STICKER", `
┃ ❌ Reply to an image, video, or sticker
                        `)
                    );
                }

                if (!/image|video|image\/webp/.test(mime)) {
                    return m.reply(
                        box("⚠️ INVALID MEDIA", `
┃ ❌ Supported: Image, Sticker, Short Video
                        `)
                    );
                }

                if (m.quoted.videoMessage && m.quoted.videoMessage.seconds > 30) {
                    return m.reply(
                        box("⏱️ VIDEO LIMIT", `
┃ ❌ Video must be 30 seconds or less
                        `)
                    );
                }

                await m.reply(
                    box("⚙️ PROCESSING", `
┃ 🛠️ Creating watermark sticker...
                    `)
                );

                const extension =
                    /image\/webp/.test(mime) ? 'webp' :
                    /image/.test(mime) ? 'jpg' : 'mp4';

                const tempFile = path.join(
                    __dirname,
                    `temp-watermark-${Date.now()}.${extension}`
                );

                const media = await client.downloadAndSaveMediaMessage(
                    m.quoted,
                    tempFile
                );

                const sticker = new Sticker(media, {
                    pack: pushname || 'DML-MD',
                    author: pushname || 'DML-MD',
                    type: StickerTypes.FULL,
                    categories: ['👑', '✨'],
                    id: `DML-${Date.now()}`,
                    quality: 60,
                    background: 'transparent'
                });

                const buffer = await sticker.toBuffer();

                await client.sendMessage(
                    m.chat,
                    { sticker: buffer },
                    { quoted: m }
                );

                await fs.unlink(tempFile).catch(() => {});

            } catch (error) {

                console.error('WatermarkSticker Error:', error.message);

                await m.reply(
                    box("⚠️ SYSTEM ERROR", `
┃ ❌ Failed to create sticker
┃ ➤ ${error.message}
                    `)
                );
            }
        }
    });
};
