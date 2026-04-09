const middleware = require('../../utils/botUtil/middleware');

const FOOTER = '> © Powered by Dml';

module.exports = {
    name: 'pin',
    aliases: ['pinmsg', 'unpin'],
    description: 'Pin or unpin a message in a group',
    run: async (context) => {
        await middleware(context, async () => {
            const { client, m, args } = context;

            if (!m.quoted) {
                return m.reply(
                    `╭━━〔 *DML-MD • PIN SYSTEM* 〕━━⬣
┃
┃ 📌 Reply to a message first.
┃ Then use this command to pin it.
┃
┃ 📝 Example:
┃ .pin
┃ .pin unpin
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
                );
            }

            const isUnpin = (args[0] || '').toLowerCase() === 'unpin';

            const messageKey = {
                id: m.quoted.id,
                remoteJid: m.chat,
                participant: m.quoted.sender
            };

            try {
                await client.pinMessage(m.chat, messageKey, isUnpin ? 0 : 1);

                await m.reply(
                    `╭━━〔 *DML-MD • ${isUnpin ? 'UNPIN SUCCESS' : 'PIN SUCCESS'}* 〕━━⬣
┃
┃ ✅ Message ${isUnpin ? 'unpinned' : 'pinned'} successfully.
┃ 📍 Group message update completed.
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
                );
            } catch (error) {
                console.error('[PIN ERROR]', error?.message || error);
                const msg = error?.message || String(error);
                const isAuth = msg.includes('forbidden') || msg.includes('not-authorized') || msg.includes('403');

                if (isAuth) {
                    await m.reply(
                        `╭━━〔 *DML-MD • PIN ERROR* 〕━━⬣
┃
┃ ❌ Failed to ${isUnpin ? 'unpin' : 'pin'} message.
┃ 👑 Make sure I am an admin in this group.
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
                    );
                } else {
                    await m.reply(
                        `╭━━〔 *DML-MD • SYSTEM ERROR* 〕━━⬣
┃
┃ ❌ Action failed.
┃ 🧾 ${msg.slice(0, 80)}
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
                    );
                }
            }
        });
    }
};
