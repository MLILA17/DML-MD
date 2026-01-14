const { URL } = require('url');

module.exports = {
  name: 'checkid',
  aliases: ['cekid', 'getid', 'id'],
  description: 'Get the JID of a WhatsApp group or channel from its invite link',
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    const toFancyFont = (text) => {
      const fonts = {
        A:'𝘼',B:'𝘽',C:'𝘾',D:'𝘿',E:'𝙀',F:'𝙁',G:'𝙂',H:'𝙃',I:'𝙄',J:'𝙅',K:'𝙆',L:'𝙇',M:'𝙈',
        N:'𝙉',O:'𝙊',P:'𝙋',Q:'𝙌',R:'𝙍',S:'𝙎',T:'𝙏',U:'𝙐',V:'𝙑',W:'𝙒',X:'𝙓',Y:'𝙔',Z:'𝙕',
        a:'𝙖',b:'𝙗',c:'𝙘',d:'𝙙',e:'𝙚',f:'𝙛',g:'𝙜',h:'𝙝',i:'𝙞',j:'𝙟',k:'𝙠',l:'𝙡',m:'𝙢',
        n:'𝙣',o:'𝙤',p:'𝙥',q:'𝙦',r:'𝙧',s:'𝙨',t:'𝙩',u:'𝙪',v:'𝙫',w:'𝙬',x:'𝙭',y:'𝙮',z:'𝙯'
      };
      return text.split('').map(c => fonts[c] || c).join('');
    };

    try {
      const text = m.body?.trim() || '';
      const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
      const link = linkMatch ? linkMatch[0] : null;

      if (!link) {
        return client.sendMessage(
          m.chat,
          {
            text: `❌ *Link Missing!*\n\n📌 Example:\n${prefix}checkid https://chat.whatsapp.com/XXXX`,
            footer: 'Paste a WhatsApp group or channel link',
            buttons: [
              { buttonId: `${prefix}menu`, buttonText: { displayText: '🤖 Open Menu' }, type: 1 }
            ],
            headerType: 1
          },
          { quoted: m }
        );
      }

      let url;
      try { url = new URL(link); } catch { return m.reply('❌ Invalid WhatsApp link format.'); }

      let id, type;

      if (url.hostname === 'chat.whatsapp.com') {
        const code = url.pathname.replace('/', '');
        const res = await client.groupGetInviteInfo(code);
        id = res.id;
        type = 'Group';
      } else if (url.hostname === 'whatsapp.com' && url.pathname.startsWith('/channel/')) {
        const code = url.pathname.split('/channel/')[1];
        const res = await client.newsletterMetadata('invite', code, 'GUEST');
        id = res.id;
        type = 'Channel';
      } else {
        return m.reply('❌ Only WhatsApp Group or Channel links are supported.');
      }

      const jidCode = `/* WhatsApp ${type} JID */\nJID: ${id}\nLink: ${link}\nType: ${type}`;

      // Send interactive message with COPY button (like pair command)
      await client.sendMessage(
        m.chat,
        {
          interactiveMessage: {
            header: `${type} JID Found!`,
            title: `🆔 *JID:*\n\`${id}\`\n\n🔗 *Link:*\n${link}\n\n📌 *Type:* ${type}`,
            footer: `⚡ Powered by ${botname}`,
            buttons: [
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: ' Copy JID',
                  id: 'copy_jid_code',
                  copy_code: jidCode
                })
              },
              {
                name: 'check_another',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔎 Check Another Link',
                  id: `${prefix}checkid`
                })
              },
              {
                name: 'menu',
                buttonParamsJson: JSON.stringify({
                  display_text: '🤖 More Commands',
                  id: `${prefix}menu`
                })
              }
            ]
          }
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('CHECKID ERROR:', err);
      await m.reply(`❌ Error: ${err.message || 'Unknown error'}`);
    }
  }
};
