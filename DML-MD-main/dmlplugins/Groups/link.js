const linkMiddleware = require('../../utility/botUtil/linkMiddleware');

module.exports = async (context) => {
    await linkMiddleware(context, async () => {
        const { client, m } = context;

        try {
            let response = await client.groupInviteCode(m.chat);

            await client.sendText(
                m.chat,
`╭─〔 🔗 Group Invite Link 〕─╮
│ Here is your group link:
│
│ https://chat.whatsapp.com/${response}
│
│ 📌 Share this link to
│ invite new members.
╰─────────────────╯`,
                m,
                { detectLink: true }
            );

        } catch (error) {
            console.error('Error generating group link:', error);

            await client.sendText(
                m.chat,
`╭─〔 ❌ Error 〕─╮
│ Failed to generate
│ the group invite link.
│ Please try again later.
╰──────────────╯`,
                m
            );
        }
    });
};
