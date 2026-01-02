const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSudoUsers } = require('../../Database/config');

module.exports = async (context) => {
  
    const { m } = context;

    const sudoUsers = await getSudoUsers();

    if (!sudoUsers || sudoUsers.length === 0) {
      return await m.reply('⚠️ No Sudo Users found.');
    }

    await m.reply(`📄 Current Sudo Users:\n\n${sudoUsers.map((jid) => `- ${jid}`).join('\n')}`);
 
};