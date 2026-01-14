module.exports = {
  name: 'checkid',
  aliases: ['cekid', 'getid', 'id'],
  description: 'Get the JID of a WhatsApp group or channel from its invite link',
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    if (!client?.sendMessage) {
      return console.error('❌ client.sendMessage is not available. Check your framework.');
    }

    const toFancyFont = (text) => {
      const fonts = { /* same as before */ };
      return text.split('').map(c => fonts[c] || c).join('');
    };

    try {
      const text = m.body?.trim() || '';
      const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
      const link = linkMatch ? linkMatch[0] : null;

      if (!link) {
        return client.sendMessage(m.chat, {
          text: `❌ *Link Missing!*\n\n📌 Example:\n${prefix}checkid https://chat.whatsapp.com/XXXX`,
          footer: 'Paste a WhatsApp group or channel link',
          buttons: [{ buttonId: `${prefix}menu`, buttonText: { displayText: '🤖 Open Menu' }, type: 1 }],
          headerType: 1
        }, { quoted: m });
      }

      let id, type;

      if (link.includes('chat.whatsapp.com')) {
        const code = link.split('/').pop();
        const res = await client.groupGetInviteInfo(code);
        id = res.id;
        type = 'Group';
      } else if (link.includes('whatsapp.com/channel')) {
        const code = link.split('/channel/')[1];
        const res = await client.newsletterMetadata('invite', code, 'GUEST');
        id = res.id;
        type = 'Channel';
      } else {
        return m.reply('❌ Only WhatsApp Group or Channel links are supported.');
      }

      const jidCode = `/* WhatsApp ${type} JID */\nJID: ${id}\nLink: ${link}\nType: ${type}`;

      // Use the same CTA copy logic as your working pair command
      await client.sendMessage(m.chat, {
        text: `✅ *${toFancyFont(type + ' ID Found!')}*\n\n🆔 JID: \`${id}\`\n🔗 Link: ${link}\n📌 Type: ${type}`,
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
          }
        ]
      }, { quoted: m });

    } catch (err) {
      console.error('CHECKID ERROR:', err);
      await m.reply(`❌ Error: ${err.message || 'Unknown error'}`);
    }
  }
};
