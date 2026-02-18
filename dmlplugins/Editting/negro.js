const axios = require('axios');

module.exports = async (context) => {
    const { client, mime, m, text, botname } = context;

    if (m.quoted && /image/.test(mime)) {
        const buffer = await m.quoted.download();
        const base64Image = buffer.toString('base64');

        await m.reply("Hold on a moment, applying the black filter to your image...");

        try {
            const response = await axios.post("https://negro.consulting/api/process-image", {
                filter: "hitam",
                imageData: "data:image/png;base64," + base64Image
            });

            const resultBuffer = Buffer.from(
                response.data.processedImageUrl.replace("data:image/png;base64,", ""),
                "base64"
            );

            await client.sendMessage(m.chat, {
                image: resultBuffer,
                caption: `Done! Your image now has the *black* filter applied.`
            }, { quoted: m });
        } catch (error) {
            const errorMessage = error.message || 'An error occurred while processing the image.';
            const replyMessage = errorMessage.length > 200
                ? errorMessage.substring(0, 200) + '...'
                : errorMessage;

            console.error("Error while processing image:", error);
            await m.reply(replyMessage);
        }
    } else {
        await m.reply("Quote an image and type *negro* to apply the black filter.");
    }
};