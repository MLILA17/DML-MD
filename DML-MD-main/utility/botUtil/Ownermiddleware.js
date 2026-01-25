const Ownermiddleware = async (context, next) => {
    const { m, Owner } = context;

    if (!Owner) {
        return m.reply(`╔═⟪ 🚫 DML-MD | OWNER COMMAND ⟫═╗
║
║ 🔥 Access Denied: Owner privileges required
║ ♻ Current user permissions insufficient
║ 🧐 Attempt logged for security review
║
║ 📌 Contact the administrator to request access
╚══════════════════════╝
> © Powered by Dml`);
    }

    await next();
};

module.exports = Ownermiddleware;
