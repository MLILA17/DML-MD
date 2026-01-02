const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;

        const formatStylishReply = (message) => {
            return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
        };

        try {
            const settings = await getSettings();
            const value = args.join(" ").toLowerCase();
            const validModes = ["off", "delete", "remove"];

            // Update mode if argument is provided
            if (validModes.includes(value)) {
                const currentMode = String(settings.antistatusmention || "off").toLowerCase();
                if (currentMode === value) {
                    return await client.sendMessage(
                        m.chat,
                        { text: formatStylishReply(`AntiStatusMention is already '${value.toUpperCase()}'.`) },
                        { quoted: m, ad: true }
                    );
                }

                await updateSetting('antistatusmention', value);
                return await client.sendMessage(
                    m.chat,
                    { text: formatStylishReply(`AntiStatusMention updated to '${value.toUpperCase()}'. 🔥`) },
                    { quoted: m, ad: true }
                );
            }

            // Show current status
            const currentStatus = String(settings.antistatusmention || "off").toLowerCase();
            const emoji = currentStatus === "delete" ? "🗑️" : currentStatus === "remove" ? "🚫" : "😴";

            const buttons = [
                { buttonId: `${prefix}antistatusmention delete`, buttonText: { displayText: "DELETE 🗑️" }, type: 1 },
                { buttonId: `${prefix}antistatusmention remove`, buttonText: { displayText: "REMOVE 🚫" }, type: 1 },
                { buttonId: `${prefix}antistatusmention off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
            ];

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(`AntiStatusMention Mode: ${currentStatus.toUpperCase()} ${emoji}`),
                    footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
                    buttons,
                    headerType: 1,
                    viewOnce: true,
                },
                { quoted: m, ad: true }
            );
        } catch (error) {
            console.error("❌ Error:", error);
            await client.sendMessage(
                m.chat,
                { text: formatStylishReply("Failed to update settings.") },
                { quoted: m, ad: true }
            );
        }
    });
};