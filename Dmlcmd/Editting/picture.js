const fs = require('fs').promises;
const path = require('path');
const { queue } = require('async');

// Queue to process one at a time for safety
const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`Picture error: ${error.message}`);
    }
    callback();
}, 1);

module.exports = async (context) => {
    const { client, m, mime } = context;

    commandQueue.push({
        context,
        run: async ({ client, m, mime }) => {
            try {
                // Must reply to a sticker
                if (!m.quoted) {
                    return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈\n❒ Please reply to a *sticker* to convert it into an image.\n╰┈┈┈┈━━━━━━┈┈┈┈◈');
                }

                const quotedMime = m.quoted.mimetype || '';
                if (!/webp/.test(quotedMime)) {
                    return m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈\n❒ The replied message is not a sticker!\n╰┈┈┈┈━━━━━━┈┈┈┈◈');
                }

                await m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈\n❒ Converting sticker to image, please wait...\n╰┈┈┈┈━━━━━━┈┈┈┈◈');

                // Temporary file paths
                const tempSticker = path.join(__dirname, `temp-sticker-${Date.now()}.webp`);
                const outputImage = path.join(__dirname, `converted-${Date.now()}.jpg`);

                // Download the sticker first
                const media = await client.downloadAndSaveMediaMessage(m.quoted, tempSticker);

                // Use ffmpeg to convert webp to jpg (Baileys environment usually supports this)
                const { exec } = require('child_process');
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i "${media}" "${outputImage}" -y`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Send converted image back
                const imageBuffer = await fs.readFile(outputImage);
                await client.sendMessage(m.chat, { image: imageBuffer, caption: '✅ Sticker converted to image!' }, { quoted: m });

                // Clean up temp files
                await fs.unlink(tempSticker).catch(() => {});
                await fs.unlink(outputImage).catch(() => {});
            } catch (error) {
                console.error(`Picture error: ${error.message}`);
                await m.reply('╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n❒ An error occurred while converting the sticker. Please try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈');
            }
        }
    });
};
//dml