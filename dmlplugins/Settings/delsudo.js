const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSettings, getSudoUsers, removeSudoUser } = require('../../Database/config');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;

        let numberToRemove;

        if (m.quoted) {
            numberToRemove = m.quoted.sender.split('@')[0];
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToRemove = m.mentionedJid[0].split('@')[0];
        } else {
            numberToRemove = args[0];
        }

        if (!numberToRemove || !/^\d+$/.test(numberToRemove)) {
            return await m.reply('❌ Please provide a valid number or quote a user.');
        }

        const settings = await getSettings();
        if (!settings) {
            return await m.reply('❌ Settings not found.');
        }

        const sudoUsers = await getSudoUsers();

        if (!sudoUsers.includes(numberToRemove)) {
            return await m.reply('⚠️ This number is not a sudo user.');
        }

      
        await removeSudoUser(numberToRemove);

        await m.reply(`✅ ${numberToRemove} has been removed from Sudo Users.`);
    });
};