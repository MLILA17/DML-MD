const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Nice try, idiot! 😈\n` +
        `│❒ This command is for groups only, you moron!\n` +
        `┗━━━━━━━━━━━━━━━┛`
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
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `│❒ Antipromote is already ${value.toUpperCase()}, you clueless moron! 🥶\n` +
          `│❒ Stop spamming my commands! 🖕\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateGroupSetting(jid, 'antipromote', action ? 'true' : 'false');
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Antipromote ${value.toUpperCase()}! 🔥\n` +
        `│❒ Promotions are under my control, king! 😈\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Antipromote Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}\n` +
        `│❒ Use "${prefix}antipromote on" or "${prefix}antipromote off", fool!\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};