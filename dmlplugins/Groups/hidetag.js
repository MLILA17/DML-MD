const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, args, participants, text } = context;

        const noticeText = `╔══❰ *GROUP HIDETAG* ❱══
║ ${text ? text : ' '}
╚══════════════════════╝`;

        await client.sendMessage(
            m.chat,
            {
                text: noticeText,
                mentions: participants.map(a => a.id)
            },
            { quoted: m }
        );
    });
};
