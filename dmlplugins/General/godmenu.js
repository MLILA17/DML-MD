const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'godmenu',
  aliases: ['god', 'holy'],
  description: 'Displays only the God holy books menu',
  run: async (context) => {
    const { client, m, pict } = context;
    const botname = '𝘿𝙈𝙇-𝙈𝘿';

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const toFancyFont = (text) => {
      const fonts = {
        'a': '𝙖','b': '𝙗','c': '𝙘','d': '𝙙','e': '𝙚','f': '𝙛','g': '𝙜','h': '𝙝','i': '𝙞','j': '𝙟',
        'k': '𝙠','l': '𝙡','m': '𝙢','n': '𝙣','o': '𝙤','p': '𝙥','q': '𝙦','r': '𝙧','s': '𝙨','t': '𝙩',
        'u': '𝙪','v': '𝙫','w': '𝙬','x': '𝙭','y': '𝙮','z': '𝙯'
      };
      return text.toLowerCase()
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    let menuText = `
╭━━━〔 👑 ${botname} 👑 〕━━━⬣
┃ ✦ 𝙂𝙊𝘿 𝙋𝙇𝘼𝘾𝙀 𝙊𝙉𝙇𝙔
┃
┃ 🔣 Prefix : ${effectivePrefix || 'None'}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📖 𝙃𝙊𝙇𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 〕━━━⬣
`;

    let commandFiles = fs.readdirSync('./dmlplugins/God')
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const commandName = file.replace('.js', '');
      const fancyCommandName = toFancyFont(commandName);
      menuText += `┃ 🙇‍♂️ ${effectivePrefix}${fancyCommandName}\n`;
    }

    menuText += `╰━━━━━━━━━━━━━━━━⬣

> ✦ Powered by Dml ✦
`;

    await client.sendMessage(m.chat, {
      text: menuText,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: false,
          title: '👑 𝘿𝙈𝙇-𝙈𝘿',
          body: 'Made by Dml from Tanzania 🇹🇿',
          thumbnail: pict,
          sourceUrl: 'https://github.com/MLILA17/DML-MD',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  }
};
