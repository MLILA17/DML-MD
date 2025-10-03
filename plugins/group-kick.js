const { cmd } = require('../command');



cmd({

    pattern: "remove",

    alias: ["kick", "k"],

    desc: "Removes a member from the group",

    category: "admin",

    react: "❌",

    filename: __filename

},

async (conn, mek, m, {

    from, q, isGroup, isBotAdmins, isGroupAdmins, reply, quoted, senderNumber

}) => {

    // Check if the command is used in a group

    if (!isGroup) return reply("❌ This command can only be used in groups.");



    // Allow only group admins

    if (!isGroupAdmins) {

        return reply("❌ Only group admins can use this command.");

    }



    // Check if the bot is an admin

    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");



    let number;

    if (m.quoted) {

        number = m.quoted.sender.split("@")[0];

    } else if (q && q.includes("@")) {

        number = q.replace(/[@\s]/g, '');

    } else {

        return reply("❌ Please reply to a message or mention a user to remove.");

    }



    const jid = number + "@s.whatsapp.net";



    try {

        await conn.groupParticipantsUpdate(from, [jid], "remove");

        reply(`✅ Successfully removed @${number}`, { mentions: [jid] });

    } catch (error) {

        console.error("Remove command error:", error);

        reply("❌ Failed to remove the member.");

    }

});
