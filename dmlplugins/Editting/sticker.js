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
    const { client, m, packname, author } = context;

    await client.sendMessage(m.chat, { react: { text: '🔃', key: m.key } });

    commandQueue.push({
        context,
        run: async ({ client, m }) => {
            try {
                let mediaMessage = null;

                if (m.message && (m.message.imageMessage || m.message.videoMessage)) {
                    mediaMessage = m.message.imageMessage || m.message.videoMessage;
                } else if (m.quoted && m.quoted.message) {
                    mediaMessage = m.quoted.message.imageMessage || 
                                  m.quoted.message.videoMessage ||
                                  m.quoted.message.stickerMessage;
                } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
                    mediaMessage = quotedMsg.imageMessage || quotedMsg.videoMessage || quotedMsg.stickerMessage;
                }

                if (!mediaMessage) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply("Where's the fvcking image or short video idiot.😑");
                }

                const isVideo = !!mediaMessage.videoMessage;
                if (isVideo && mediaMessage.videoMessage.seconds > 30) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply('Videos must be 30 seconds or shorter.');
                }

                let mediaToDownload = null;
                if (m.message && (m.message.imageMessage || m.message.videoMessage)) {
                    mediaToDownload = m;
                } else if (m.quoted) {
                    mediaToDownload = m.quoted;
                } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    mediaToDownload = {
                        message: m.message.extendedTextMessage.contextInfo.quotedMessage,
                        key: m.key
                    };
                }

                if (!mediaToDownload) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply("Couldn't find media to download.");
                }

                const tempFile = path.join(__dirname, `temp-sticker-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
                const mediaPath = await client.downloadAndSaveMediaMessage(mediaToDownload, tempFile.replace(path.extname(tempFile), ''));

                const sticker = new Sticker(mediaPath, {
                    pack: packname || 'p',
                    author: author || 'Dml [dev]',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: 50,
                    background: 'transparent'
                });

                const buffer = await sticker.toBuffer();

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

                await fs.unlink(mediaPath).catch(() => {});
                if (mediaPath !== tempFile) await fs.unlink(tempFile).catch(() => {});

            } catch (error) {
                console.error(`Sticker error: ${error.message}`);
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                await m.reply('Error while creating sticker. Try again.');
            }
        }
    });
};