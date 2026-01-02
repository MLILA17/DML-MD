const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`WatermarkSticker error: ${error.message}`);
    }
    callback();
}, 1); // 1 at a time

module.exports = async (context) => {
    const { client, m, mime, pushname } = context;

    if (!m.sender.includes('your-owner-number@s.whatsapp.net')) {
        return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈\n❒ Only owners can use this command.\n╰┈┈┈┈━━━━━━┈┈┈┈◈');
    }

    commandQueue.push({
        context,
        run: async ({ client, m, mime, pushname }) => {
            try {
                if (!m.quoted) {
                    return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈\n❒ Quote an image, a short video, or a sticker to change watermark.\n╰┈┈┈┈━━━━━━┈┈┈┈◈');
                }

                if (!/image|video|image\/webp/.test(mime)) {
                    return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n❒ This is neither a sticker, image, nor a short video!\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈');
                }

                if (m.quoted.videoMessage && m.quoted.videoMessage.seconds > 30) {
                    return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n❒ Videos must be 30 seconds or shorter.\n╰┈┈┈┈━━━━━━┈┈┈┈◈');
                }

                const tempFile = path.join(__dirname, `temp-watermark-${Date.now()}.${/image\/webp/.test(mime) ? 'webp' : /image/.test(mime) ? 'jpg' : 'mp4'}`);
                await m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n❒ A moment, 🄵🄴🄴-🅇🄼🄳 is creating the sticker...\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈');

                const media = await client.downloadAndSaveMediaMessage(m.quoted, tempFile);

                const stickerResult = new Sticker(media, {
                    pack: pushname || 'ᅠᅠᅠᅠ',
                    author: pushname || 'Fredi_Ai',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: 50, // Lower quality to reduce memory
                    background: 'transparent'
                });

                const buffer = await stickerResult.toBuffer();
                await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

                await fs.unlink(tempFile).catch(() => console.warn('Failed to delete temp file'));
            } catch (error) {
                console.error(`WatermarkSticker error: ${error.message}`);
                await m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n❒ An error occurred while creating the sticker. Please try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈');
            }
        }
    });
};