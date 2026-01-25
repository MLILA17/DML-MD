const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, Owner, participants, botname } = context;

        if (!botname) {
            console.error(`Botname not set.`);
            return m.reply(
`╔══❰ *SYSTEM ERROR* ❱══
║ ❌ Bot name not found
║ ⚙️ Configuration is incomplete
║ 📩 Please contact the developer
╚══════════════════════╝`
            );
        }

        if (!Owner) {
            console.error(`Owner not set.`);
            return m.reply(
`╔══❰ *SYSTEM ERROR* ❱══
║ ❌ Owner information missing
║ ⚙️ Context validation failed
║ 📩 Please notify the developer
╚══════════════════════╝`
            );
        }

        if (!m.isGroup) {
            return m.reply(
`╔══❰ *COMMAND RESTRICTED* ❱══
║ 🚫 This command works in groups only
║ 📘 Please use it inside a group
╚══════════════════════╝`
            );
        }

        try {
            const maxMentions = 50;
            const mentions = participants.slice(0, maxMentions).map(a => a.id);

            await client.sendMessage(
                m.chat,
                { 
                    text:
`╔══❰ *${botname} | NOTICE* ❱══
║ 👋 Bot is leaving the group
║ 👥 Participants notified: ${mentions.length}
║ ℹ️ ${mentions.length < participants.length ? 'Some members were not mentioned due to limits.' : 'All members mentioned.'}
╚══════════════════════╝`,
                    mentions 
                },
                { quoted: m }
            );

            console.log(`[LEAVE-DEBUG] Leaving group ${m.chat}, mentioned ${mentions.length} participants`);
            await client.groupLeave(m.chat);

        } catch (error) {
            console.error(`[LEAVE-ERROR] Couldn’t leave group: ${error.stack}`);
            await m.reply(
`╔══❰ *ACTION FAILED* ❱══
║ ❌ Unable to leave the group
║ 🛠️ Reason: ${error.message}
║ 🔁 Please try again later
╚══════════════════════╝`
            );
        }
    });
};
// dml
