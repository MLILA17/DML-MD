const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Upload image to qu.ax and return URL
async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
        });

        const link = response.data?.files?.[0]?.url;
        if (!link) throw new Error('No URL returned in response');

        fs.unlinkSync(tempFilePath);
        return { url: link };
    } catch (error) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw new Error(`Upload error: ${error.message}`);
    }
}

module.exports = async (context) => {
    const { client, mime, m } = context;

    const box = (title, body) => {
        return `╭━〔 ${title} 〕━╮
${body}
╰━━━━━━━━━━━━━━━━╯`;
    };

    // Get the image (quoted or current message)
    const quoted = m.quoted ? m.quoted : m;
    const quotedMime = quoted.mimetype || mime || '';

    if (!/image/.test(quotedMime)) {
        return m.reply(
            box("⚠️ INVALID MEDIA", "Please reply to or send an image with this command.")
        );
    }

    const processing = await m.reply(
        box("🎨 PROCESSING", "Creating your *Studio Ghibli*-style artwork... please wait 🌸")
    );

    try {
        // 1️⃣ Download image
        const media = await quoted.download();
        if (!media) {
            return m.reply(box("❌ ERROR", "Failed to download the image. Try again."));
        }

        // 2️⃣ Size limit check
        if (media.length > 10 * 1024 * 1024) {
            return m.reply(box("📦 SIZE LIMIT", "❒The image is too large (max 10MB)."));
        }

        // 3️⃣ Upload image
        const { url: imageUrl } = await uploadImage(media);

        // 4️⃣ Call Ghibli API
        const apiResponse = await axios.get('https://fgsi.koyeb.app/api/ai/image/toGhibli', {
            params: {
                apikey: 'fgsiapi-2dcdfa06-6d',
                url: imageUrl,
            },
            responseType: 'arraybuffer',
        });

        const ghibliBuffer = Buffer.from(apiResponse.data);

        // 5️⃣ Send Ghibli-style image
        await client.sendMessage(
            m.chat,
            {
                image: ghibliBuffer,
                caption: box("🌸 GHIBLI STYLE", ` Your image has been reimagined in *Studio Ghibli* style!`)
            },
            { quoted: m }
        );

        // Delete processing message
        await client.sendMessage(m.chat, { delete: processing.key });

    } catch (err) {
        console.error("ToGhibli Error:", err.message);
        await m.reply(box("⚠️ ERROR", `Failed to generate Ghibli-style image: ${err.message}`));
    }
};
