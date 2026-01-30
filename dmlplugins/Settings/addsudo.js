const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSudoUsers, addSudoUser } = require('../../Database/config');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;

    let numberToAdd;

    if (m.quoted) {
      numberToAdd = m.quoted.sender.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      numberToAdd = m.mentionedJid[0].split('@')[0];
    } else {
      numberToAdd = args[0];
    }

    if (!numberToAdd || !/^\d+$/.test(numberToAdd)) {
      return await m.reply(
        `┏━━〔 ⚠ SYSTEM WARNING 〕━━┓
┃ ▸ Invalid input detected 
┃ ▸ Use a valid number
┃ ▸ Or quote a target user
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    const sudoUsers = await getSudoUsers();
    if (sudoUsers.includes(numberToAdd)) {
      return await m.reply(
        `┏━━〔 🛡 SUDO STATUS 〕━━┓
┃ ▸ Access already granted 🥶
┃ ▸ ${numberToAdd}
┃ ▸ Member of the elite ranks
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    await addSudoUser(numberToAdd);
    await m.reply(
      `┏━━〔 SYSTEM UPDATE 〕━━┓
┃ ▸ Privileges granted 🔥
┃ ▸ User: ${numberToAdd}
┃ ▸ Rank: SUDO KING 🤔
┗━━━━━━━━━━━━━━━━━━━━━━━┛`
    );
  });
};
