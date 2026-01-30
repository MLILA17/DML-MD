const { getSettings, getGroupSettings, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const jid = m.chat;

    const formatStylishReply = (message) => {
      return `╔═════〔 🚀 FEATURE 〕═════╗
║  ${message}
╚══════════════════════╝`;
    };

    try {
      if (!jid.endsWith('@g.us')) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Hi, Bro 🥺 This command only works in groups, not your sad Dm.") },
          { quoted: m, ad: true }
        );
      }

      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("No settings found. Fix it, loser. ") },
          { quoted: m, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      let groupSettings = await getGroupSettings(jid);
      console.log('Dml-md: Group settings for', jid, ':', groupSettings);
      let isEnabled = groupSettings?.events === true || groupSettings?.events === 'true';

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Hi, Bro ✋🏻 Events are already ${value.toUpperCase()} in this group! Stop wasting my time.`
              ),
            },
            { quoted: m, ad: true }
          );
        }

        await updateGroupSetting(jid, 'events', action);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Events ${value.toUpperCase()}! 🔥 ${action ? 'Group events are live, let’s make some chaos! 💥' : 'Events off, you boring loser. 😴'}`
            ),
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}events on`, buttonText: { displayText: 'ON ✅' }, type: 1 },
        { buttonId: `${prefix}events off`, buttonText: { displayText: 'OFF ❎' }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Events Status: ${isEnabled ? 'ON ✅' : 'OFF ❎'}. Pick a vibe, mood`
          ),
          footer: '> ©POWERED BY Dml',
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Dml-Md: Error in events.js:', error.stack);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Shit broke, couldn’t update events. Database error: ${error.message}. Try later.`
          ),
        },
        { quoted: m, ad: true }
      );
    }
  });
};
//DML
