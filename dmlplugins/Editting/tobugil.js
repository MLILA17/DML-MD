const axios = require('axios');

async function uploadToCatbox(buffer) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
            headers: form.getHeaders(),
            timeout: 30000
        }
    );

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('UPLOAD_FAILED');
    }

    return response.data;
}

module.exports = {
    name: 'tobugil',
    aliases: ['bugil', 'nudeedit', 'nude'],
    description: 'Apply special artistic filter to an image',

    run: async (context) => {
        const { client, m } = context;

        const box = (title, body) => {
            return `╭━〔 ${title} 〕━╮
${body}
╰━━━━━━━━━━━━━━━━╯`;
        };

        // Must reply
        if (!m.quoted) {
            return client.sendMessage(
                m.chat,
                {
                    text: box("🖼️ IMAGE FILTER", `
┃ ❌ Please reply to an image
┃ ➤ Example: Reply → .tobugil
                    `)
                },
                { quoted: m }
            );
        }

        const q = m.quoted;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            return client.sendMessage(
                m.chat,
                {
                    text: box("⚠️ INVALID MEDIA", `
┃ ❌ The replied message is not an image
┃ ➤ Please reply to a photo
                    `)
                },
                { quoted: m }
            );
        }

        try {
            // Loading reaction
            await client.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
            });

            const mediaBuffer = await q.download();

            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('DOWNLOAD_FAILED');
            }

            const uploadedURL = await uploadToCatbox(mediaBuffer);
            const encodedImageUrl = encodeURIComponent(uploadedURL);

            const apiUrl = `https://api.baguss.xyz/api/edits/tobugil?image=${encodedImageUrl}`;

            const response = await axios.get(apiUrl, {
                timeout: 120000,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            });

            if (!response.data?.success || !response.data?.url) {
                throw new Error('INVALID_API_RESPONSE');
            }

            const resultUrl = response.data.url;

            // Success reaction
            await client.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

            await client.sendMessage(
                m.chat,
                {
                    image: { url: resultUrl },
                    caption: `╭━〔 ✨ FILTER COMPLETE 〕━╮
┃ 🎨 Image successfully processed
┃ 👤 Requested by: ${m.pushName}
╰━━━━━━━━━━━━━━━━╯

🔥 Powered by DML-MD`
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Tobugil error:', error.message);

            await client.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });

            let errorMessage = "Image processing failed.";

            if (error.message.includes('UPLOAD_FAILED')) {
                errorMessage = "Upload service failed.";
            } else if (error.message.includes('timeout')) {
                errorMessage = "API request timed out.";
            } else if (error.message.includes('INVALID_API_RESPONSE')) {
                errorMessage = "API returned invalid response.";
            } else if (error.message.includes('Network')) {
                errorMessage = "Network error detected.";
            }

            await client.sendMessage(
                m.chat,
                {
                    text: box("⚠️ SYSTEM ERROR", `
┃ ❌ ${errorMessage}
                    `)
                },
                { quoted: m }
            );
        }
    },
};
