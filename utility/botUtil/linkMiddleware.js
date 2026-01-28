module.exports = async (context, next) => {
    const { m, isBotAdmin } = context;

    if (!m.isGroup) {
    return m.reply(
`╔══〔 ⚠️ DML-MD | Group Only 〕═
║ ⏺ Command unavailable in private chats
║ 🫂 Please use this command inside a group
║
║ 💡 Tip: Add the bot to a group to access this feature
╚══════════════════════╝`
    );
}

if (!isBotAdmin) {
    return m.reply(
`╔═〔 🔒 DML-MD | Admin Required 〕═
║ 🚀 Bot cannot execute this command without admin rights
║ ❎ Please grant the bot admin privileges
║
║ 💡 Tip: Promote the bot to admin to enable this action
╚══════════════════════╝`
    );
}
    await next(); // Proceed to the next function (main handler)
};
