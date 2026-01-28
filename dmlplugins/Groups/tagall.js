module.exports = async (context) => {
    const { client, m, participants, text } = context;

    if (!m.isGroup) {
        return client.sendMessage(
            m.chat,
            {
                text: `╔══❰ *NOTICE* ❱══
║ 🚫 This command is for groups only
║ 📘 Please use it inside a group
╚══════════════════════╝`
            },
            { quoted: m }
        );
    }

    try {
        const mentions = participants.map(a => a.id);

        const txt = [
            `╔══❰ *GROUP TAG NOTICE* ❱══`,
            `║ 👋 You have been mentioned in this group`,
            `║ 💬 Message: ${text ? text : 'No message provided'}`,
            `║`,
            ...mentions.map(id => `║ 👤 @${id.split('@')[0]}`),
            `╚══════════════════════╝`
        ].join('\n');

        await client.sendMessage(
            m.chat,
            { text: txt, mentions },
            { quoted: m }
        );
    } catch (error) {
        console.error(`Tagall error: ${error.message}`);
        await client.sendMessage(
            m.chat,
            {
                text: `╔══❰ *ERROR* ❱══
║ ❌ Failed to tag participants
║ 🔁 Please try again later
╚══════════════════════╝`
            },
            { quoted: m }
        );
    }
};
