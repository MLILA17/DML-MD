const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'fullmenu',
  aliases: ['allmenu', 'commandslist'],
  description: 'Displays the full bot command menu by category',
  run: async (context) => {
    const { client, m, totalCommands, mode, pict } = context;
    const botname = 'DML-MD';

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const categories = [
      { name: 'General', display: 'GEᑎEᖇᗩᒪMENU', emoji: '📜' },
      { name: 'Settings', display: 'SETTINGSMENU', emoji: '🛠️' },
      { name: 'Owner', display: 'OWNERMENU', emoji: '👑' },
      { name: 'Heroku', display: 'HEROKUMENU', emoji: '☁️' },
      { name: 'Wa-Privacy', display: 'PRIVACYMENU', emoji: '🔒' },
      { name: 'Groups', display: 'GROUPMENU', emoji: '👥' },
      { name: 'AI', display: 'AIMENU', emoji: '🧠' },
      { name: 'Media', display: 'DOWNLOADMENU', emoji: '🎬' },
      { name: 'Editting', display: 'EDITINGMENU', emoji: '✂️' },
      { name: 'Logo', display: 'LOGOMENU', emoji: '🎨' },
      { name: '+18', display: '+18MENU', emoji: '🔞' },
      { name: 'Utils', display: 'UTILSMENU', emoji: '🔧' }
    ];

    const getGreeting = () => {
      const currentHour = DateTime.now().setZone('Africa/Nairobi').hour;
      if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
      if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
      if (currentHour >= 18 && currentHour < 22) return 'Good Evening';
      return 'Good Night';
    };

    const getCurrentTimeInNairobi = () => {
      return DateTime.now()
        .setZone('Africa/Nairobi')
        .toLocaleString(DateTime.TIME_SIMPLE);
    };

    const toFancyFont = (text, isUpperCase = false) => {
      const fonts = {
        'A': '𝘼','B': '𝘽','C': '𝘾','D': '𝘿','E': '𝙀','F': '𝙁','G': '𝙂','H': '𝙃','I': '𝙄','J': '𝙅','K': '𝙆','L': '𝙇','M': '𝙈',
        'N': '𝙉','O': '𝙊','P': '𝙋','Q': '𝙌','R': '𝙍','S': '𝙎','T': '𝙏','U': '𝙐','V': '𝙑','W': '𝙒','X': '𝙓','Y': '𝙔','Z': '𝙕',
        'a': '𝙖','b': '𝙗','c': '𝙘','d': '𝙙','e': '𝙚','f': '𝙛','g': '𝙜','h': '𝙝','i': '𝙞','j': '𝙟','k': '𝙠','l': '𝙡','m': '𝙢',
        'n': '𝙣','o': '𝙤','p': '𝙥','q': '𝙦','r': '𝙧','s': '𝙨','t': '𝙩','u': '𝙪','v': '𝙫','w': '𝙬','x': '𝙭','y': '𝙮','z': '𝙯'
      };

      return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    const username = m.pushName || "User";

    let menuText = `╭─❒ 「 ${botname} Command Menu ⚠ 」\n`;
    menuText += `│ ${getGreeting()}, @${username}\n`;
    menuText += `│\n`;
    menuText += `│ 🤖 *Bot*: ${botname}\n`;
    menuText += `│ 📋 *Total Commands*: ${totalCommands || 0}\n`;
    menuText += `│ 🕒 *Time*: ${getCurrentTimeInNairobi()}\n`;
    menuText += `│ 🔣 *Prefix*: ${effectivePrefix || 'None'}\n`;
    menuText += `│ 🌐 *Mode*: ${mode || 'Public'}\n`;
    menuText += `│ 📚 *Library*: Baileys\n`;
    menuText += `╰─────────────\n\n`;

    menuText += `*COMMANDS REGISTRY ☑*\n\n`;

    for (const category of categories) {
      let commandFiles = [];

      const dirPath = path.join(__dirname, `../../dmlplugins/${category.name}`);
      if (fs.existsSync(dirPath)) {
        commandFiles = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.js'));
      }

      // Skip empty categories except +18
      if (commandFiles.length === 0 && category.name !== '+18') continue;

      menuText += `╭─❒ 「 ${category.display} ${category.emoji} 」\n`;

      // Handle +18 manual commands only
      if (category.name === '+18') {
        const plus18Commands = ['xvideo'];
        for (const cmd of plus18Commands) {
          const fancyCommandName = toFancyFont(cmd);
          menuText += `│ ✘ *${fancyCommandName}*\n`;
        }

        menuText += `╰─────────────\n\n`;
        continue;
      }

      for (const file of commandFiles) {
        const commandName = file.replace('.js', '');
        const fancyCommandName = toFancyFont(commandName);
        menuText += `│ ✘ *${fancyCommandName}*\n`;
      }

      menuText += `╰─────────────\n\n`;
    }

    menuText += `> Powered by Dml`;

    await client.sendMessage(
      m.chat,
      {
        text: menuText,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: `DML-MD`,
            body: `Powered by Dml`,
            thumbnail: pict,
            sourceUrl: `https://github.com/MLILA17/DML-MD`,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );
  }
};
