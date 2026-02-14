const { DateTime } = require('luxon');
const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'searchmenu',
  aliases: ['searchcmds'],
  description: 'Displays only the Search menu',
  run: async (context) => {
    const { client, m, pict } = context;
    const botname = '𝘿𝙈𝙇-𝙈𝘿';

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const time = DateTime.now().setZone('Africa/Dar_es_Salaam')
      .toFormat('HH:mm:ss');

    const toFancyFont = (text) => {
      const fonts = {
        'a': '𝙖','b': '𝙗','c': '𝙘','d': '𝙙','e': '𝙚','f': '𝙛','g': '𝙜',
        'h': '𝙝','i': '𝙞','j': '𝙟','k': '𝙠','l': '𝙡','m': '𝙢','n': '𝙣',
        'o': '𝙤','p': '𝙥','q': '𝙦','r': '𝙧','s': '𝙨','t': '𝙩','u': '𝙪',
        'v': '𝙫','w': '𝙬','x': '𝙭','y': '𝙮','z': '𝙯'
      };
      return text.toLowerCase()
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    let menuText = `
╭━━━〔 🔎 𝙎𝙀𝘼𝙍𝘾𝙃 𝙋𝘼𝙉𝙀𝙇 〕━━━⬣
┃ 🤖 Bot   : ${botname}
┃ ⏰ Time  : ${time}
┃ 🔣 Prefix: ${effectivePrefix || 'None'}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📂 𝘼𝙑𝘼𝙄𝙇𝘼𝘽𝙇𝙀 𝘾𝙈𝘿𝙎 〕━━━⬣
`;

    let commandFiles = fs.readdirSync('./dmlplugins/Search')
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const commandName = file.replace('.js', '');
      const fancyCommandName = toFancyFont(commandName);
      menuText += `┃ ✦ ${effectivePrefix}${fancyCommandName}\n`;
    }

    menuText += `╰━━━━━━━━━━━━━━━━⬣

> ⚡ Powered by Dml
`;

    await client.sendMessage(
      m.chat,
      {
        text: menuText,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: '🔎 DML-MD SEARCH',
            body: 'Advanced Search Command System',
            thumbnail: pict,
            sourceUrl: 'https://github.com/MLILA17/DML-MD',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );
  }
};
