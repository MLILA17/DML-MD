const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: '+18menu',
  aliases: ['nsfwmenu', 'adultmenu'],
  description: 'Displays only the +18 menu',
  run: async (context) => {
    const { client, m, pict } = context;
    const botname = '𝙳𝙼𝙻-𝚇𝙼𝙳';

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const toFancyFont = (text, isUpperCase = false) => {
      const fonts = {
        'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝙿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
        'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
        'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
        'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
      };
      return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    let menuText = `╭─❒ 「 ${botname} Command Menu ⚠ 」\n`;
    menuText += `│ +18 Menu Only (Degenerates Only)\n`;
    menuText += `│\n`;
    menuText += `│ 🔣 *Pɾҽϝιx*: ${effectivePrefix || 'None'}\n`;
    menuText += `╰─────────────\n\n`;

    menuText += `╭─❒ 「 +18MENU 🔞 」\n`;

    let commandFiles = fs.readdirSync('./dmlplugins/+18').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const commandName = file.replace('.js', '');
      const fancyCommandName = toFancyFont(commandName);
      menuText += `│ ✘ *${fancyCommandName}*\n`;
    }

    menuText += `╰─────────────\n\n`;
    menuText += `> Pσɯҽɾҽԃ Ⴆყ 𝙳𝙼𝙻-𝚇𝙼𝙳`;

    await client.sendMessage(m.chat, {
      text: menuText,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: false,
          title: `𝙳𝙼𝙻-𝚇𝙼𝙳 WA bot`,
          body: `Pσɯҽɾҽԃ Ⴆყ 𝙳𝙼𝙻-𝚇𝙼𝙳`,
          thumbnail: pict,
          sourceUrl: `https://github.com/MLILA17/DML-MD`,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  }
};