const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m } = context;

        if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
            return m.reply(
`╭─〔 ⚠️ User Required 〕─╮
│ Please mention a user
│ or reply to a message.
╰─────────────────╯`
            );
        }

        let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : null;

        if (!users) {
            return m.reply(
`╭─〔 ❌ Invalid User 〕─╮
│ The specified user
│ could not be found.
╰───────────────╯`
            );
        }

        const parts = users.split('@')[0];

        await client.groupParticipantsUpdate(m.chat, [users], 'promote');

        m.reply(
`╭─〔 👑 Promotion Success 〕─╮
│ @${parts} is now
│ a group admin 🥇
╰────────────────────╯`,
            { mentions: [users] }
        );
    });
};
//dml
