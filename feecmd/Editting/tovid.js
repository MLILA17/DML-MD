const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'sticker.webp' });
    const response = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
    if (!response.data || !response.data.includes('catbox')) throw new Error('Upload Refused');
    return response.data;
}

module.exports = {
    name: 'tomp4',
    aliases: ['tovideo', 'stickertomp4', 'sticker2video'],
    description: 'Converts stickers to MP4 videos',
    run: async (context) => {
        const { client, m, mime } = context;
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
            if (!m.quoted) return m.reply('The command requires a STICKER. Your empty reply suggests you cannot read.');
            const quotedMime = m.quoted.mimetype || '';
            if (!/webp/.test(quotedMime)) return m.reply('That is a file, not a sticker. The .webp extension is a clue you seem to have missed.');
            const statusMsg = await m.reply('Forcing your static sticker into a video. A pointless endeavor.');
            const stickerBuffer = await m.quoted.download();
            if (!stickerBuffer) {
                await client.sendMessage(m.chat, { delete: statusMsg.key });
                return m.reply('Failed to download. Your sticker is as inaccessible as common sense.');
            }
            const stickerUrl = await uploadToCatbox(stickerBuffer);
            const encodedUrl = encodeURIComponent(stickerUrl);
            const convertApiUrl = `https://api.elrayyxml.web.id/api/maker/convert?url=${encodedUrl}&format=MP4`;
            const response = await axios.get(convertApiUrl, { headers: { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 30000 });
            if (!response.data.status || !response.data.result) throw new Error('The converter deemed your sticker unworthy.');
            const videoUrl = response.data.result;
            const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 20000 });
            const videoBuffer = Buffer.from(videoResponse.data);
            await client.sendMessage(m.chat, { delete: statusMsg.key });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            await client.sendMessage(m.chat, { video: videoBuffer, caption: 'Behold, your motionless "video".\n—\n🄵🄴🄴-🅇🄼🄳' }, { quoted: m });
            await client.sendMessage(m.chat, { document: videoBuffer, mimetype: 'video/mp4', fileName: `sticker_${Date.now()}.mp4`, caption: 'Document version. Marginally more useful.\n—\n🄵🄴🄴-🅇🄼🄳' }, { quoted: m });
        } catch (err) {
            console.error('ToMP4 error:', err);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            let userMessage = 'The conversion failed utterly. What did you expect?';
            if (err.message.includes('timeout')) userMessage = 'The process timed out. Your sticker is likely more complex than your thoughts.';
            if (err.message.includes('Network Error')) userMessage = 'A network error. Are you connected to the void?';
            if (err.message.includes('Upload Refused')) userMessage = "The upload service rejected your file. It has taste.";
            if (err.message.includes('converter deemed')) userMessage = 'The conversion API refused to process this. Try a simpler sticker.';
            await m.reply(`${userMessage}\nError: ${err.message}`);
        }
    }
};