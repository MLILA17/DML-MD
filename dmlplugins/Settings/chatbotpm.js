const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `🤖 Chatbot PM STATUS\n━━━━━━━━━━━━━━\n${message}\n━━━━━━━━━━━━━━`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("The database is currently unavailable. No settings were found.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();
      const validValues = ['on', 'off'];

      if (!validValues.includes(value)) {
        const buttons = [
          { buttonId: `${prefix}chatbotpm on`, buttonText: { displayText: "ENABLE 🤖" }, type: 1 },
          { buttonId: `${prefix}chatbotpm off`, buttonText: { displayText: "DISABLE 🔴" }, type: 1 },
        ];

        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Chatbot PM is currently ${settings.chatbotpm ? 'ENABLED' : 'DISABLED'}.\n\nUse:\n${prefix}chatbotpm on\n${prefix}chatbotpm off`
            ),
            footer: "> © POWERED BY DML",
            buttons,
            headerType: 1,
            viewOnce: true,
          },
          { quoted: m, ad: true }
        );
      }

      const newState = value === 'on';
      if (settings.chatbotpm === newState) {
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Chatbot PM is already ${newState ? 'ENABLED' : 'DISABLED'}. No changes were made.`
            ),
          },
          { quoted: m, ad: true }
        );
      }

      await updateSetting('chatbotpm', newState);
      return await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Chatbot PM has been successfully ${newState ? 'ENABLED' : 'DISABLED'}.\n\n${newState ? 'I am now ready to respond automatically 🤖' : 'Automatic replies have been turned off 😴'}`
          ),
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Error toggling chatbotpm:', error);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            "An unexpected error occurred while updating Chatbot PM. Please try again later."
          ),
        },
        { quoted: m, ad: true }
      );
    }
  });
};
