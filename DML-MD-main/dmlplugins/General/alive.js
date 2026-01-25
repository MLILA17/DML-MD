const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, prefix, pict, botname } = context;

    if (!botname) {
        console.error('[ALIVE] botname is missing');
        return m.reply(
            `❌ *System Error*\n\nBot name is not configured.\nPlease contact the developer.`
        );
    }

    if (!pict) {
        console.error('[ALIVE] pict is missing');
        return m.reply(
            `⚠️ *Image Error*\n\nNo image was provided to send.\nPlease check the command setup.`
        );
    }

    try {
        const caption = 
`👋 Hello *${m.pushName}*

✅ *${botname}* is active and running smoothly.

📌 *Quick Info*
• Prefix: ${prefix}
• Status: Online
• Mode: Ready to serve

📂 Type *${prefix}menu* to view available commands.

 
🤖 Powered by *Dml*`;

        // Image handling
        let imageOptions;

        if (Buffer.isBuffer(pict)) {
            const tempImagePath = path.join(__dirname, 'temp_alive_image.jpg');
            fs.writeFileSync(tempImagePath, pict);
            imageOptions = { url: tempImagePath };
        } 
        else if (typeof pict === 'string') {
            if (
                pict.startsWith('http://') ||
                pict.startsWith('https://') ||
                fs.existsSync(pict)
            ) {
                imageOptions = { url: pict };
            } else {
                throw new Error('Invalid image path or URL');
            }
        } 
        else {
            throw new Error(`Unsupported pict type: ${typeof pict}`);
        }

        // Send image with caption
        await client.sendMessage(
            m.chat,
            {
                image: imageOptions,
                caption,
                mentions: [m.sender]
            },
            { quoted: m }
        );

        // Cleanup temp image
        if (imageOptions.url && imageOptions.url.includes('temp_alive_image')) {
            fs.unlinkSync(imageOptions.url);
        }

    } catch (error) {
        console.error('[ALIVE ERROR]', error.stack);
        await m.reply(
            `❌ *Command Failed*\n\nSomething went wrong while processing your request.\n\nError: ${error.message}`
        );
    }
};
