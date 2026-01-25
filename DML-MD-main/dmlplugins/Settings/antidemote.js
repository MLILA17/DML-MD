const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `╭─〔 ❌ DML-MD NOTICE 〕─╮
│ ❎ Command rejected
│ 🧐 Available in groups only
╰───────────────────╯`
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antidemote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
          `╭─〔 ⚙️ SETTINGS 〕─╮
│ Antidemote is already set to ${value.toUpperCase()}
│ No update was made
╰───────────────╯`
        );
      }

      await updateGroupSetting(jid, 'antidemote', action ? 'true' : 'false');
      await m.reply(
        `╭─〔 ⚠️ GROUP SECURITY 〕─╮
│ Antidemote is now ${value.toUpperCase()}
│ Demotion protection is active
╰────────────────────╯`
      );
    } else {
      await m.reply(
        `╭─〔 ⚙️ ANTIDEMOTE STATUS 〕─╮
│ ❒ Status: ${isEnabled ? 'ON ✅' : 'OFF ❎'}
│ ❒ Use: ${prefix}antidemote on or off
╰──────────────────────╯`
      );
    }
  });
};
//DML
