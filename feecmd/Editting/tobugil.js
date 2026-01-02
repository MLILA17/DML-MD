const axios = require('axios');

async function uploadToCatbox(buffer) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('UPLOAD FAILED');
    }

    return response.data;
}

module.exports = {
    name: 'tobugil',
    aliases: ['bugil', 'nudeedit', 'nude'],
    description: 'Apply tobugil filter to images',
    run: async (context) => {
        const { client, m } = context;

        if (!m.quoted) {
            return client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ Quote an image, you blind moron. 🤦🏻\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`
            }, { quoted: m });
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            return client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ That's not an image, you illiterate fool. 🖼️\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`
            }, { quoted: m });
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const mediaBuffer = await q.download();
            const uploadedURL = await uploadToCatbox(mediaBuffer);
            
            const encodedImageUrl = encodeURIComponent(uploadedURL);
            const apiUrl = `https://api.baguss.xyz/api/edits/tobugil?image=${encodedImageUrl}`;

            const response = await axios.get(apiUrl, {
                timeout: 120000, // 2 minutes timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.data?.success || !response.data?.url) {
                throw new Error('API returned invalid response');
            }

            const resultUrl = response.data.url;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(
                m.chat,
                {
                    image: { url: resultUrl },
                    caption: `Wkwk. 🤡\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Tobugil error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = "Failed to process image, API probably hates your ugly picture. ";
            
            if (error.message.includes('UPLOAD FAILED')) {
                errorMessage += "Catbox upload failed. 📤";
            } else if (error.message.includes('timeout')) {
                errorMessage += "Processing took too long, your image is trash. ⏱️";
            } else if (error.message.includes('Invalid response')) {
                errorMessage += "API returned garbage. 🗑️";
            } else if (error.message.includes('Network Error')) {
                errorMessage += "Network issue, check your connection. 🌐";
            } else {
                errorMessage += `Error: ${error.message}`;
            }

            await client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ ${errorMessage}\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`
            }, { quoted: m });
        }
    },
};