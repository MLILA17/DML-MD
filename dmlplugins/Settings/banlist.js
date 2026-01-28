const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getBannedUsers } = require('../../Database/config');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m } = context;

        const bannedUsers = await getBannedUsers();

        if (!bannedUsers || bannedUsers.length === 0) {
            return await m.reply('✅ There are no banned users at the moment.');
        }

        const list = bannedUsers.map((num, index) => `${index + 1}. ${num}`).join('\n');
        await m.reply(`❌ *Banned Users:*\n\n${list}`);
    });
};