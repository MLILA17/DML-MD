const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.autobio === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autobio’s already ${value.toUpperCase()}, you brain-dead fool! Stop wasting my time. 😈`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autobio', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autobio ${value.toUpperCase()} activated! 🔥 ${action ? 'Bot’s flexing status updates every 10 seconds, bow down! 🦁' : 'No more status flexing, you’re not worth it. 😴'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autobio on`, buttonText: { displayText: "ON 🦁" }, type: 1 },
        { buttonId: `${prefix}autobio off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autobio’s ${settings.autobio ? 'ON 🦁' : 'OFF 😴'}, dumbass. Pick a vibe, noob! 😈`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn’t mess with autobio. Database or something’s fucked. Try later.") },
        { quoted: m, ad: true }
      );
    }
  });
};