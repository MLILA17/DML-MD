const { getSettings, getSudoUsers, getBannedUsers } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, prefix } = context;

    const settings = await getSettings();
    const botName = process.env.BOTNAME || settings.botname || 'DML-MD';
    const sudoUsers = await getSudoUsers();
    const bannedUsers = await getBannedUsers();
    const groupCount = Object.keys(await client.groupFetchAllParticipating()).length;

    const formatStylishReply = (message) => {
      return `╔═════〔 🚀 MESSAGE 〕═════╗
║  ${message}
╚══════════════════════╝`;
    };

    const buttons = [
      { buttonId: `${prefix}botname`, buttonText: { displayText: 'Botname 🤖' }, type: 1 },
      { buttonId: `${prefix}prefix`, buttonText: { displayText: 'Prefix ⚙️' }, type: 1 },
      { buttonId: `${prefix}autoread`, buttonText: { displayText: 'Autoread 👀' }, type: 1 },
      { buttonId: `${prefix}autoview`, buttonText: { displayText: 'Autoview Status 📸' }, type: 1 },
      { buttonId: `${prefix}autolike`, buttonText: { displayText: 'Autolike Status ❤️' }, type: 1 },
      { buttonId: `${prefix}reaction`, buttonText: { displayText: 'React Emoji 😂' }, type: 1 },
      { buttonId: `${prefix}setpackname`, buttonText: { displayText: 'Sticker Watermark 🖼️' }, type: 1 },
      { buttonId: `${prefix}autobio`, buttonText: { displayText: 'Autobio 📝' }, type: 1 },
      { buttonId: `${prefix}anticall`, buttonText: { displayText: 'Anticall 📞' }, type: 1 },
      { buttonId: `${prefix}antidelete`, buttonText: { displayText: 'Antidelete 🗑️' }, type: 1 },
      { buttonId: `${prefix}presence`, buttonText: { displayText: 'Presence 🌐' }, type: 1 },
      { buttonId: `${prefix}mode`, buttonText: { displayText: 'Mode 🔒' }, type: 1 },
      { buttonId: `${prefix}chatbotpm`, buttonText: { displayText: 'Chatbot PM 💬' }, type: 1 },
    ];

    const message = formatStylishReply(
      `*DML-MD SETTINGS* 🔥\n\n` +
      `Botname: ${botName}\n` +
      `Prefix: ${settings.prefix || 'None'}\n` +
      `Antidelete: ${settings.antidelete ? '✅ ON' : '❌ OFF'}\n` +
      `Chatbot PM: ${settings.chatbotpm ? '✅ ON' : '❌ OFF'}\n` +
      `Sudo Users: ${sudoUsers.length > 0 ? sudoUsers.join(', ') : 'None'}\n` +
      `Banned Users: ${bannedUsers.length}\n` +
      `Total Groups: ${groupCount}\n\n` +
      `Tap a button to configure a setting! `
    );

    await client.sendMessage(
      m.chat,
      {
        text: message,
        footer: '> ©POWERED BY DML-MD',
        buttons,
        headerType: 1,
        viewOnce: true,
      },
      { quoted: m, ad: true }
    );
  });
};
//DML-MD
