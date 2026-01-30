const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
`┏━━〔 ⚠ SYSTEM WARNING 〕━━┓
┃ ▸ Group-only command
┃ ▸ This action is blocked
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antipromote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
`┏━━〔 ℹ STATUS CHECK 〕━━┓
┃ ▸ Antipromote already ${value.toUpperCase()} 🥶
┃ ▸ No changes applied
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        );
      }

      await updateGroupSetting(jid, 'antipromote', action ? 'true' : 'false');

      await m.reply(
`┏━━〔 ✅ SYSTEM UPDATE 〕━━┓
┃ ▸ Antipromote ${value.toUpperCase()} 🔥
┃ ▸ Promotion control enabled
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    } else {
      await m.reply(
`┏━━〔 📊 ANTIPROMOTE STATUS 〕━━┓
┃ ▸ Current: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}
┃ ▸ Commands:
┃   ${prefix}antipromote on
┃   ${prefix}antipromote off
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
