const middleware = async (context, next) => {
    const { m, isBotAdmin, isAdmin } = context;

  
    if (!m.isGroup) {
    return m.reply(
`╭─〔 ⚠️ DML-MD | Group Only 〕─
│ ❗ Command unavailable in private chats
│ 👥 Only usable within groups
│
│ 💡 Tip: Try this command in a group
╰──────────────────────╯`
    );
}

if (!isAdmin) {
    return m.reply(
`╭─〔 🔐 DML-MD | Admin Required 〕─
│ ❎ Permission Denied
│ 🫂 Only group admins can run this command
│
│ 📌 Tip: Ask an admin to grant access
╰──────────────────────╯`
    );
}

if (!isBotAdmin) {
    return m.reply(
`╭─〔 🛡️ DML-MD | Bot Admin Required 〕─
│ ❌ Action Blocked
│ ⚠️ Bot needs admin privileges
│
│ 📌 Tip: Promote the bot to admin and retry
╰──────────────────────╯`
    );
}

    await next(); // Proceed to the next function (main handler)
};

module.exports = middleware;
