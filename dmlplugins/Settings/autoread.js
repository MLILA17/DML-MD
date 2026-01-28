const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╔═════〔 🚀 MESSAGE 〕═════╗
║  ${message}
╚══════════════════════╝`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("No settings found. Fix it, loser.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.autoread === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autoread message already ${value.toUpperCase()}, Bro. Stop wasting my time. 🥺`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autoread', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autoread ${value.toUpperCase()} activated! 🔥 ${action ? 'Bot’s reading every message like a creep. ' : 'No more spying on your trash messages. 😂'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autoread on`, buttonText: { displayText: "ON ✅" }, type: 1 },
        { buttonId: `${prefix}autoread off`, buttonText: { displayText: "OFF ❎" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autoread’s ${settings.autoread ? 'ON ✅' : 'OFF ❎'}, dumbass. Pick a vibe, noob! 😌`),
          footer: "> ©POWERED BY DML",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn’t mess with autoread. Database or something’s fucked. Try later.") },
        { quoted: m, ad: true }
      );
    }
  });
};
//DML
