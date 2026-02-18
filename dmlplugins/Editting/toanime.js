const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
        });

        const link = response.data.files?.[0]?.url;
        if (!link) throw new Error('Upload failed: No URL returned');

        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return { url: link };

    } catch (error) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw error;
    }
}

module.exports = {
    name: 'toanime',
    aliases: ['anime', 'toon', 'cartoon'],
    description: 'Convert replied image to anime style',

    run: async (context) => {
        const { client, m } = context;

        const box = (title, body) => {
            return `╭━〔 ${title} 〕━╮
${body}
╰━━━━━━━━━━━━━━━━━━╯`;
        };

        // 1️⃣ Must reply
        if (!m.quoted) {
            return m.reply(
                box("🎌 TO ANIME", `
┃ ❌ Reply to an image
┃ ➤ Example:
┃ Reply to photo → .toanime
                `)
            );
        }

        const quoted = m.quoted;

        // 2️⃣ Safe MIME detection
        let mime = '';
        if (quoted.mtype === 'imageMessage' && quoted.msg?.mimetype) {
            mime = quoted.msg.mimetype;
        } else if (quoted.mimetype) {
            mime = quoted.mimetype;
        }

        if (!mime || !mime.startsWith('image/')) {
            return m.reply(
                box("⚠️ INVALID MEDIA", `
┃ ❌ The replied message is not an image
┃ ➤ Please reply to a photo
                `)
            );
        }

        // 3️⃣ Processing notice
        const processing = await m.reply(
            box("⚙️ PROCESSING", `
┃ 🎨 Converting image to anime...
┃ ⏳ Please wait
            `)
        );

        try {

            // 4️⃣ Download
            const media = await quoted.download();
            if (!media || media.length === 0)
                throw new Error('Download failed');

            // 5️⃣ Size limit
            if (media.length > 10 * 1024 * 1024) {
                return m.reply(
                    box("📦 SIZE LIMIT", `
┃ ❌ Image too large (Max 10MB)
                    `)
                );
            }

            // 6️⃣ Upload
            const { url: imageUrl } = await uploadImage(media);

            // 7️⃣ Anime API
            const apiResponse = await axios.get(
                'https://fgsi.koyeb.app/api/ai/image/toAnime',
                {
                    params: {
                        apikey: 'fgsiapi-2dcdfa06-6d',
                        url: imageUrl
                    },
                    responseType: 'arraybuffer',
                    timeout: 90000
                }
            );

            const animeBuffer = Buffer.from(apiResponse.data);

            // 8️⃣ Send result
            await client.sendMessage(
                m.chat,
                {
                    image: animeBuffer,
                    caption: `╭━〔 🎌 ANIME COMPLETE 〕━╮
┃ ✨ Transformation Successful
┃ 👤 Requested by: ${m.pushName}
╰━━━━━━━━━━━━━━━━╯

🌸 Powered by Dml`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

            // 9️⃣ Delete processing message
            await client.sendMessage(m.chat, { delete: processing.key });

        } catch (err) {

            console.error('ToAnime Error:', err.message);

            let errorMsg = "Transformation failed.";

            if (err.response) {
                errorMsg = `API Error: ${err.response.status}`;
            } else if (err.message.includes('timeout')) {
                errorMsg = "API request timed out.";
            } else {
                errorMsg = err.message;
            }

            await m.reply(
                box("⚠️ SYSTEM ERROR", `
┃ ❌ ${errorMsg}
                `)
            );
        }
    }
};
