module.exports = async (context) => {
    const { client, m } = context;

    try {
        await client.sendMessage(
            m.chat,
            {
                audio: { url: "https://files.catbox.moe/fac856.mp3" },
                mimetype: "audio/mpeg",
                ptt: false
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply(`*❌ Technologia Failed!*\n_Error: ${error.message}_`);
    }
};
