const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is fucked, no settings found. Fix it, loser.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();
      const isEnabled = settings.anticall === true;

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Yo, genius! 😈 Anticall is already ${value.toUpperCase()}! Stop wasting my time, moron. 🖕`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('anticall', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Anticall ${value.toUpperCase()} ! 🔥 Callers will get wrecked! 💀`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}anticall on`, buttonText: { displayText: "ON 🥶" }, type: 1 },
        { buttonId: `${prefix}anticall off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Anticall Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}. Pick a vibe, noob! 😈`),
          footer: "> Callers will get wrecked! 💀",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn’t update anticall. Database or something’s fucked. Try later.") },
        { quoted: m, ad: true }
      );
    }
  });
};
//DML