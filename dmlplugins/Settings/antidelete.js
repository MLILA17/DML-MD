const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╔═════〔 🚀 FEATURE 〕═════╗
║  ${message}
╚══════════════════════╝`;
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
        if (settings.antidelete === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Antidelete’s already ${value.toUpperCase()}, Focus and get straight to the point.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('antidelete', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Antidelete ${value.toUpperCase()} activated! 🔥 ${action ? 'No deletions are allowed under active moderation ' : 'Deletions are ignored for non-priority users.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}antidelete on`, buttonText: { displayText: "ON ✅" }, type: 1 },
        { buttonId: `${prefix}antidelete off`, buttonText: { displayText: "OFF ❎" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Antidelete’s ${settings.antidelete ? 'ON ✅' : 'OFF ❎'}, dumbass. Pick a vibe, noob! 😈`),
          footer: "> Type `on` or `off` to toggle antidelete.",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn’t mess with antidelete. Database or something’s fucked. Try later.") },
        { quoted: m, ad: true }
      );
    }
  });
};
//DML
