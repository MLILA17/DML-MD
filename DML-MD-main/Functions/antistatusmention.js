const { getSettings } = require("../Database/config"); 

module.exports = async (client, m) => {
    try {
        if (!m?.message) return;
        if (m.key.fromMe) return;
        if (!m.isGroup) return;

        const exemptGroup = "120363156185607326@g.us";
        if (m.chat === exemptGroup) return;

        const settings = await getSettings();
        const mode = settings.antistatusmention;

        if (!mode || mode === "off" || mode === "false") return;

        if (m.mtype !== 'groupStatusMentionMessage') return;

        const isAdmin = m.isAdmin;
        const isBotAdmin = m.isBotAdmin;

        // ADMIN NOTICE
        if (isAdmin) {
            await client.sendMessage(m.chat, {
                text: `╔══❰ *DML-MD | NOTICE* ❱══
║ 👤 User: @${m.sender.split("@")[0]}
║ 🛡️ Role: Group Admin
║ ✅ Status mentions allowed
║ 📘 Admin privileges confirmed
╚══════════════════════╝`,
                mentions: [m.sender],
            });
            return;
        }

        if (!isBotAdmin) return;

        // DELETE MESSAGE
        await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.sender,
            },
        });

        // DELETE MODE NOTICE
        if (mode === "delete" || mode === "true") {
            await client.sendMessage(m.chat, {
                text: `╔══❰ *DML-MD | Anti Status Mention* ❱══
║ 👤 User: @${m.sender.split("@")[0]}
║ ⚠️ Policy Violation detected
║ 🧹 Message deleted by system
║ 🚨 Warning: Repeated action may lead to removal
╚══════════════════════╝`,
                mentions: [m.sender],
            });
        }

        // REMOVE MODE NOTICE
        if (mode === "remove") {
            try {
                await client.groupParticipantsUpdate(m.chat, [m.sender], "remove");
                await client.sendMessage(m.chat, {
                    text: `╔══❰ *DML-MD | NOTICE* ❱══
║ 👤 User: @${m.sender.split("@")[0]}
║ 🔗 Policy Violation: Status mention
║ 🚪 Action: User removed from group
║ 📘 Please review group rules
╚══════════════════════╝`,
                    mentions: [m.sender],
                });
            } catch {
                await client.sendMessage(m.chat, {
                    text: `╔══❰ *DML-MD | ERROR* ❱══
║ ❌ Action failed
║ 🔐 Bot lacks admin permissions
║ ⚙️ Please check bot role
╚══════════════════════╝`,
                });
            }
        }
    } catch (err) {}
};
