/**
 * Checks and returns the JID of a WhatsApp group or channel from a link.
 * @module checkid
 */
module.exports = {
  name: 'checkid',
  aliases: ['cekid', 'getid', 'id'],
  description: 'Get the JID of a WhatsApp group or channel from its invite link',
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    /**
     * Fancy font utility
     */
    const toFancyFont = (text, isUpperCase = false) => {
      const fonts = {
        'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
        'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
        'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
        'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
      };
      return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
        .split('')
        .map(char => fonts[char] || char)
        .join('');
    };

    try {
      /**
       * Extract link from message
       */
      const text = m.body.trim();
      const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
      const link = linkMatch ? linkMatch[0] : null;

      if (!link) {
        return client.sendMessage(m.chat, {
          text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Yo, @${m.sender.split('@')[0]}, you forgot the link, genius!\n│❒ Example: ${prefix}checkid https://chat.whatsapp.com/ABC123...\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      let url;
      try {
        url = new URL(link);
      } catch {
        return client.sendMessage(m.chat, {
          text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Invalid link, @${m.sender.split('@')[0]}! 😤\n│❒ Send a proper WhatsApp group or channel link.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      let id, type;

      /**
       * Handle Group Links
       */
      if (url.hostname === 'chat.whatsapp.com' && /^\/[A-Za-z0-9]{20,}$/.test(url.pathname)) {
        const code = url.pathname.replace(/^\/+/, '');
        const res = await client.groupGetInviteInfo(code);
        id = res.id;
        type = 'Group';
      }
      /**
       * Handle Channel Links
       */
      else if (url.hostname === 'whatsapp.com' && url.pathname.startsWith('/channel/')) {
        const code = url.pathname.split('/channel/')[1]?.split('/')[0];
        if (!code) throw new Error('Invalid channel link format');
        const res = await client.newsletterMetadata('invite', code, 'GUEST');
        id = res.id;
        type = 'Channel';
      }
      /**
       * Invalid Link
       */
      else {
        return client.sendMessage(m.chat, {
          text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Unsupported link, @${m.sender.split('@')[0]}! 😡\n│❒ Only WhatsApp group or channel links allowed.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
          mentions: [m.sender]
        }, { quoted: m });
      }

      /**
       * Success: Send JID
       */
      await client.sendMessage(m.chat, {
        text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ *${toFancyFont(type + ' ID Found!')}*\n\n` +
              `🔗 *Link*: ${link}\n` +
              `🆔 *JID*: \`${id}\`\n` +
              `📌 *Type*: ${type}\n\n` +
              `│❒ Copy the JID above, nerd! Powered by *${botname}*\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
      }, { quoted: m });

    } catch (error) {
      console.error('CheckID command error:', error);
      await client.sendMessage(m.chat, {
        text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Error, @${m.sender.split('@')[0]}! 😤\n│❒ ${error.message || 'Unknown error'}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
        mentions: [m.sender]
      }, { quoted: m });
    }
  }
};