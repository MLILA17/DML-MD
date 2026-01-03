const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Yo, dumbass, this command’s for groups only. Get lost.`);
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Database is fucked, no settings found. Fix it, loser.`);
      }

      let groupSettings = await getGroupSetting(jid);
      if (!groupSettings) {
        return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ No group settings found. Database’s acting up, try again.`);
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      if (value === 'on' || value === 'off') {
        if (!isBotAdmin) {
          return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Make me an admin first, you clown. Can’t touch antiforeign without juice.`);
        }

        const action = value === 'on';

        if (isEnabled === action) {
          return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Antiforeign’s already ${value.toUpperCase()}, genius. Stop wasting my time.`);
        }

        await updateGroupSetting(jid, 'antiforeign', action);
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Antiforeign’s now ${value.toUpperCase()}. Foreigners better watch out or get yeeted!`);
      } else {
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Antiforeign’s ${isEnabled ? 'ON' : 'OFF'} in this group, dipshit.\n\nUse ${prefix}antiforeign on or ${prefix}antiforeign off to change it.`);
      }
    } catch (error) {
      console.error('[Antiforeign] Error in command:', error);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Shit broke, couldn’t mess with antiforeign. Database or something’s fucked. Try later.`);
    }
  });
};