/**
 * Gets the JID of a WhatsApp group or channel from an invite link
 * @module checkid
 */
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'checkid',
  aliases: ['cekid', 'getid', 'id'],
  description: 'Get the JID of a WhatsApp group or channel from its invite link',
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    // Fancy font utility
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

    try {
      const text = m.body.trim();
      const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
      const link = linkMatch ? linkMatch[0] : null;

      if (!link) {
        return client.sendMessage(m.chat, {
          text: `❌ *Oops!* @${m.sender.split('@')[0]}, you forgot to provide a link!\n` +
                `💡 Example: ${prefix}checkid https://chat.whatsapp.com/ABC123`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      let url;
      try {
        url = new URL(link);
      } catch {
        return client.sendMessage(m.chat, {
          text: `❌ *Invalid link!* @${m.sender.split('@')[0]} 😤\n` +
                `📌 Please send a proper WhatsApp group or channel link.`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      let id, type;

      // Group Links
      if (url.hostname === 'chat.whatsapp.com' && /^\/[A-Za-z0-9]{20,}$/.test(url.pathname)) {
        const code = url.pathname.replace(/^\/+/, '');
        const res = await client.groupGetInviteInfo(code);
        id = res.id;
        type = 'Group';
      }
      // Channel Links
      else if (url.hostname === 'whatsapp.com' && url.pathname.startsWith('/channel/')) {
        const code = url.pathname.split('/channel/')[1]?.split('/')[0];
        if (!code) throw new Error('Invalid channel link format');
        const res = await client.newsletterMetadata('invite', code, 'GUEST');
        id = res.id;
        type = 'Channel';
      }
      // Unsupported Links
      else {
        return client.sendMessage(m.chat, {
          text: `❌ *Unsupported link!* @${m.sender.split('@')[0]} 😡\n` +
                `📌 Only WhatsApp group or channel links are allowed.`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      // ===============================
      // OPTIONAL RANDOM IMAGE HEADER
      // ===============================
      const imagesDir = path.join(__dirname, '../Dmlimages');
      let imageBuffer;
      if (fs.existsSync(imagesDir)) {
        const images = fs.readdirSync(imagesDir).filter(f =>
          /^menu\d+\.jpg$/i.test(f)
        );
        if (images.length > 0) {
          const random = images[Math.floor(Math.random() * images.length)];
          imageBuffer = fs.readFileSync(path.join(imagesDir, random));
        }
      }

      // ===============================
      // INTERACTIVE MESSAGE WITH CTA_COPY
      // ===============================
      await client.sendMessage(m.chat, {
        ...(imageBuffer ? { image: imageBuffer } : {}),
        interactiveMessage: {
          header: `🔗 ${type} JID Found!`,
          title: `Link: ${link}\n\nJID: \`${id}\`\n\nType: ${type}`,
          footer: `⚡ Powered by ${botname}`,
          buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'Copy JID',
                id: 'copy_jid_code',
                copy_code: id
              })
            }
          ]
        }
      }, { quoted: m });

    } catch (error) {
      console.error('CheckID command error:', error);
      await client.sendMessage(m.chat, {
        text: `❌ *Error!* @${m.sender.split('@')[0]}\n` +
              `⚠️ ${error.message || 'Unknown error occurred'}`,
        mentions: [m.sender]
      }, { quoted: m });
    }
  }
};
