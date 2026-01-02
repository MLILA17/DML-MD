const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });
    const response = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
    if (!response.data || !response.data.includes('catbox')) throw new Error('Upload Refused');
    return response.data;
}

module.exports = async (context) => {
    const { client, m } = context;
    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        const quoted = m.quoted ? m.quoted : m;
        const quotedMime = quoted.mimetype || '';
        if (!/image/.test(quotedMime)) return m.reply('That is not an image. Are your eyes broken? Quote a real image, you imbecile.');
        const media = await quoted.download();
        if (!media) return m.reply('Failed to download your worthless image. Try sending something that actually exists.');
        if (media.length > 10 * 1024 * 1024) return m.reply('Your image is too large. Do you think I have infinite storage? 10MB MAX, you digital hoarder.');
        const imageUrl = await uploadToCatbox(media);
        const apiURL = `https://api.fikmydomainsz.xyz/imagecreator/tofigur?url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiURL);
        if (!response.data || !response.data.status || !response.data.result) throw new Error('The API vomited nonsense back at me.');
        const resultUrl = response.data.result;
        const figureBuffer = (await axios.get(resultUrl, { responseType: 'arraybuffer' })).data;
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await client.sendMessage(m.chat, { image: Buffer.from(figureBuffer), caption: 'Here. It is now a "figure". You are welcome.\n—\n🄵🄴🄴-🅇🄼🄳' }, { quoted: m });
    } catch (err) {
        console.error('tofigur error:', err);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        let userMessage = 'It failed. What a surprise.';
        if (err.message.includes('timeout')) userMessage = 'Took too long. Your image is probably as heavy as your stupidity.';
        if (err.message.includes('Network Error')) userMessage = 'Network error. Are you on dial-up?';
        if (err.message.includes('Upload Refused')) userMessage = "Couldn't even upload your image. Pathetic.";
        if (err.message.includes('API vomited')) userMessage = 'The art service rejected your image. It has standards.';
        await m.reply(`${userMessage}\nError: ${err.message}`);
    }
};