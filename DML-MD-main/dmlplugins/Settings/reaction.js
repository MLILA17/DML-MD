const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newEmoji = args[0];

    const settings = await getSettings();
    const prefix = settings.prefix;
    const currentEmoji = settings.reactEmoji || 'Not set';

    if (newEmoji) {
      if (newEmoji === 'random') {
        if (currentEmoji === 'random') {
          return await m.reply(
`╭─〔 🔁 REACTION SETTINGS 〕─╮
│ ⚠️ Already using random emojis
│ 🎲 Chaos mode is already active
╰─────────────────────╯`
          );
        }

        await updateSetting('reactEmoji', 'random');
        await m.reply(
`╭─〔 🔥 REACTION UPDATED 〕─╮
│ 🎲 Mode : Random Emojis
│ 😔 Status reactions will be wild
╰─────────────────────╯`
        );
      } else {
        if (currentEmoji === newEmoji) {
          return await m.reply(
`╭─〔 ⚠️ NO CHANGES MADE 〕─╮
│ 😐 Emoji already set to ${newEmoji}
│ 🔄 Try a different one
╰─────────────────────╯`
          );
        }

        await updateSetting('reactEmoji', newEmoji);
        await m.reply(
`╭─〔 ✅ REACTION UPDATED 〕─╮
│ 😍 Emoji Set : ${newEmoji}
│ 🚀 Applied successfully
╰─────────────────────╯`
        );
      }
    } else {
      await m.reply(
`╭─〔 ⚙️ REACTION STATUS 〕─╮
│ 🔍 Current Emoji : ${currentEmoji}
│
│ 📌 Usage:
│ • ${prefix}reaction random
│ • ${prefix}reaction <emoji>
╰─────────────────╯`
      );
    }
  });
};
// DML-MD
