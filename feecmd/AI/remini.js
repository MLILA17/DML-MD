const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
    });

    const text = await response.text();
    if (!text.includes('catbox')) {
        throw new Error('UPLOAD FAILED');
    }

    return text;
}

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!botname) {
        return m.reply(`BOT IS BROKEN BLAME THE DEV 🤡`);
    }

    if (!text && !m.quoted && !(m.mtype === 'imageMessage' && m.body.includes('.remini'))) {
        return m.reply(`GIVE ME AN IMAGE YOU DUMBASS 🤦🏻\nEXAMPLE: .remini https://image.com/trash.png OR REPLY TO IMAGE`);
    }

    let imageUrl = text;

    if ((!text || text === '.remini') && m.quoted && m.quoted.mtype === 'imageMessage') {
        try {
            const buffer = await client.downloadMediaMessage(m.quoted);
            imageUrl = await uploadToCatbox(buffer);
        } catch (uploadError) {
            console.error(`FAILED UPLOAD: ${uploadError.message}`);
            return m.reply(`CANT UPLOAD YOUR SHITTY IMAGE 🤦🏻 TRY AGAIN`);
        }
    }

    if (m.mtype === 'imageMessage' && m.body.includes('.remini')) {
        try {
            const buffer = await client.downloadMediaMessage(m);
            imageUrl = await uploadToCatbox(buffer);
        } catch (uploadError) {
            console.error(`FAILED UPLOAD: ${uploadError.message}`);
            return m.reply(`CANT UPLOAD YOUR SHITTY IMAGE 🤦🏻 TRY AGAIN`);
        }
    }

    if (!imageUrl || imageUrl === '.remini') {
        return m.reply(`NO VALID IMAGE YOU CLUELESS TWAT 🤡`);
    }

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.elrayyxml.web.id/api/tools/remini?url=${encodedUrl}`;

        const response = await fetch(apiUrl, {
            timeout: 30000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        });

        if (!response.ok) {
            throw new Error(`API PUKE ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
            throw new Error(`API DIDNT RETURN AN IMAGE 🤦🏻 GOT: ${contentType}`);
        }

        const imageBuffer = await response.buffer();

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            {
                image: imageBuffer,
                caption: `HERE'S YOUR ENHANCED SHIT 🤡\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(`ERROR IN REMINI: ${error.message}`);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`SHIT BROKE 🤦🏻 ERROR: ${error.message}`);
    }
};