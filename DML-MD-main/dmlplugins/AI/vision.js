const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('Upload process failed');
    }

    return response.data;
}

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
      
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        if (!m.quoted) {
            return m.reply("Do I look like a mind reader to you? Quote an image, you absolute moron.");
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            return m.reply("Seriously? That's not an image. Are your eyes as dysfunctional as your brain?");
        }

        const mediaBuffer = await q.download();
        const prompt = text ? text : "What is this image about?";
        
    
        const loadingMsg = await m.reply(`Analyzing your image with prompt: "${prompt}"...`);

        const uploadedURL = await uploadToCatbox(mediaBuffer);
        
        const api = `https://api.ootaizumi.web.id/ai/gptnano?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(uploadedURL)}`;
        const result = await axios.get(api);

    
        await client.sendMessage(m.chat, { delete: loadingMsg.key });

        if (result.data?.result) {
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return client.sendMessage(
                m.chat,
                {
                    text: `🔍 *Image Analysis Results*\n\n*Prompt Used:* ${prompt}\n\n*Analysis:*\n${result.data.result}\n\n—\n*©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳*`,
                },
                { quoted: m }
            );
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply("The AI returned utter nonsense. Perhaps your image is as indecipherable as your life choices.");

    } catch (err) {
        console.error('Image analysis error:', err);
        
       
        try {
            if (loadingMsg) await client.sendMessage(m.chat, { delete: loadingMsg.key });
        } catch (e) {}
        
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Analysis failed spectacularly. Error: ${err.message}\n\nTry again when you've collected more than two brain cells.`);
    }
};