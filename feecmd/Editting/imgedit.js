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
  const { client, m, text } = context;
  try {
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
    if (!m.quoted) return m.reply("Quote an image, you blind, incompetent fool. How hard is that?");
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!mime.startsWith('image/')) return m.reply("That is not an image. Are your eyes decorative?");
    const prompt = text ? text : "add a text stating idk";
    const mediaBuffer = await q.download();
    const uploadedUrl = await uploadToCatbox(mediaBuffer);
    const apiUrl = `https://api-faa.my.id/faa/editfoto?url=\( {encodeURIComponent(uploadedUrl)}&prompt= \){encodeURIComponent(prompt)}`;
    const editResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    await client.sendMessage(m.chat, { image: Buffer.from(editResponse.data), caption: `Here. It's done. Prompt: ${prompt}\n—\n🄵🄴🄴-🅇🄼🄳` }, { quoted: m });
  } catch (error) {
    console.error('imgedit error:', error);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    let userMessage = 'It failed. Of course it did.';
    if (error.message.includes('timeout')) userMessage = 'Took too long. Your image is probably as tedious as you are.';
    if (error.message.includes('Network Error')) userMessage = 'Network error. Fix your internet, you digital caveman.';
    if (error.message.includes('Upload Refused')) userMessage = "Couldn't even upload your garbage file.";
    await m.reply(`${userMessage}\nError: ${error.message}`);
  }
};