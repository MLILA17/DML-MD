const { getSettings } = require("../Database/config");

module.exports = async (client, m) => {
    try {
        if (!m?.message) return;
        if (m.key.fromMe) return;
        if (!m.isGroup) return;

        const settings = await getSettings();
        const antilinkMode = (settings.antilink || "off").toLowerCase();

        // OFF = ignore everything
        if (antilinkMode === "off") return;

        const isAdmin = m.isAdmin;
        const isBotAdmin = m.isBotAdmin;

        // Allow admins to send links
        if (isAdmin) return;

        // Bot must be admin for any action
        if (!isBotAdmin) return;

        // Extract text
        let text = "";

        if (m.message.conversation) {
            text = m.message.conversation;
        } else if (m.message.extendedTextMessage?.text) {
            text = m.message.extendedTextMessage.text;
        } else if (m.message.imageMessage?.caption) {
            text = m.message.imageMessage.caption;
        } else if (m.message.videoMessage?.caption) {
            text = m.message.videoMessage.caption;
        } else if (m.message.documentMessage?.caption) {
            text = m.message.documentMessage.caption;
        }

        // Detect links
        
const urlRegex =
  /(https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|t\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|whatsapp\.com\/[^\s]+|tinyurl\.com\/[^\s]+|discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+|instagram\.com\/[^\s]+|facebook\.com\/[^\s]+|fb\.me\/[^\s]+|youtube\.com\/[^\s]+|youtu\.be\/[^\s]+|tiktok\.com\/[^\s]+|telegram\.me\/[^\s]+|linktr\.ee\/[^\s]+|github\.com\/[^\s]+)/gi;

        if (!urlRegex.test(String(text).toLowerCase())) return;

        // Delete message
        await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.sender,
            },
        });

        // Fee warning message
        await client.sendMessage(m.chat, {
            text:
                `★┈┈❰ *FEE-XMD ANTILINK* ❱┈┈★\n` +
                `┋➤ 😒 @${m.sender.split("@")[0]}, you really thought you could drop a link here?\n` +
                `┋➤ 🧹 Message swept away.\n` +
                (antilinkMode === "remove"
                    ? `┋➤ 🚪 And now you're getting kicked. Actions ➤ Consequences.\n`
                    : `┋➤ ⚠️ Try that again and see what happens.\n`) +
                `╰┈┈┈┈━━━━━━┈┈┈┈◈`,
            mentions: [m.sender],
        });

        // Kick user if mode = remove
        if (antilinkMode === "remove") {
            const user = m.sender;
            const tag = user.split("@")[0];

            try {
                await client.groupParticipantsUpdate(m.chat, [user], "remove");

                await client.sendMessage(m.chat, {
                    text:
                        `----«❰ *🄵🄴🄴-🅇🄼🄳* ❱»-----\n` +
                        `│★ 🚫 @${tag} has been *yeeted* out for dropping links.\n` +
                        `│★ Next time, read the rules. If you can.\n` +
                        `╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                    mentions: [user],
                });
            } catch {
                await client.sendMessage(m.chat, {
                    text:
                        `◈━━❰ *🄵🄴🄴-🅇🄼🄳* ❱━━◈\n` +
                        `│➤ 🤦 Can't kick @${tag}. Probably missing admin perms.\n` +
                        `│➤ Fix that, boss.\n` +
                        `╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                    mentions: [user],
                });
            }
        }
    } catch (err) {
        // Silent fail — Fee-Xmd doesn't whine 😏
    }
};