const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSettings, banUser, getBannedUsers, getSudoUsers } = require('../../Database/config');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;

        let settings = await getSettings();
        if (!settings) {
            return await m.reply('❌ Settings not found.');
        }

        const sudoUsers = await getSudoUsers();
        

        let numberToBan;

        if (m.quoted) {
            numberToBan = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToBan = m.mentionedJid[0];
        } else {
            numberToBan = args[0];
        }

        if (!numberToBan) {
            return await m.reply('❌ Please provide a valid number or quote a user.');
        }

      
        if (numberToBan.includes('@s.whatsapp.net')) {
            numberToBan = numberToBan.split('@')[0];
        }

        

        if (sudoUsers.includes(numberToBan)) {
            return await m.reply('❌ You cannot ban a Sudo User.');
        }

        const bannedUsers = await getBannedUsers();

        if (bannedUsers.includes(numberToBan)) {
            return await m.reply('⚠️ This user is already banned.');
        }

        await banUser(numberToBan);
        await m.reply(`✅ ${numberToBan} has been banned.`);
    });
};