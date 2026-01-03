const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newEmoji = args[0];

    const settings = await getSettings();
    const prefix = settings.prefix;
    const currentEmoji = settings.reactEmoji || 'No react emoji set, loser! 😴';

    if (newEmoji) {
      if (newEmoji === 'random') {
        if (currentEmoji === 'random') {
          return await m.reply(
            `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `┋❒ Already set to random, you brain-dead fool! 😔\n` +
            `┋❒ I’m already throwing random emojis! 🥶\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈`
          );
        }
        await updateSetting('reactEmoji', 'random');
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
          `┋❒ Random emoji mode ON! 🔥\n` +
          `┋❒ Statuses will get wild reactions! 😔\n` +
          `╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      } else {
        if (currentEmoji === newEmoji) {
          return await m.reply(
            `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
            `┋❒ Emoji already ${newEmoji}, moron! 😔\n` +
            `┋❒ Pick something else, noob! 🙇🏽‍♂️\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈`
          );
        }
        await updateSetting('reactEmoji', newEmoji);
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `┋❒ Status react emoji set to ${newEmoji}! 🔥\n` +
          `┋❒ Flexing it like a king! 💞\n` +
          `╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }
    } else {
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `┋❒ Current Reaction: ${currentEmoji}\n` +
        `┋❒ Use "${prefix}reaction random" for chaos or "${prefix}reaction <emoji>" for one emoji, fool!\n` +
        `╰┈┈┈┈━━━━━━┈┈┈┈◈`
      );
    }
  });
};