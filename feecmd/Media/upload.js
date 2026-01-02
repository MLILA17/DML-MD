const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!mime) return m.reply('Please quote or send a media file to upload.');

        const mediaBuffer = await q.download();

        if (mediaBuffer.length > 256 * 1024 * 1024) {
            return m.reply('Media is too large. Max size is 256MB.');
        }

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', mediaBuffer, { 
            filename: `upload_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
            contentType: mime || 'application/octet-stream'
        });

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
        });

        if (!response.data || !response.data.includes('catbox')) {
            throw new Error('UPLOAD FAILED');
        }

        const link = response.data;
        const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            interactiveMessage: {
                header: "Media Uploaded Successfully ✅",
                title: `Media Link: \n\n${link}\n\nSize: ${fileSizeMB} MB`,
                footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
                buttons: [
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Copy Link",
                            id: `copy_${Date.now()}`,
                            copy_code: link,
                        }),
                    },
                ],
            },
        }, { quoted: m });

    } catch (err) {
        console.error('Upload error:', err);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`Error during upload: ${err.message}`);
    }
};