const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'listonline',
  aliases: ['online', 'active', 'onlineusers'],
  description: 'List currently online group members',
  run: async (context) => {
    const { client, m } = context;

    if (!m.isGroup) {
      return client.sendMessage(m.chat, {
        text:
`🚫 *GROUP ONLY COMMAND*
━━━━━━━━━━━━━━━━━━
• This command works in groups only
• Use it inside a WhatsApp group
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      const groupMetadata = await client.groupMetadata(m.chat);
      const participants = groupMetadata.participants || [];

      const onlineUsers = participants
        .filter(p => p.presence && (p.presence === 'available' || p.presence === 'composing'))
        .map(p => p.id);

      if (onlineUsers.length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return client.sendMessage(m.chat, {
          text:
`😴 *NO ACTIVE MEMBERS*
━━━━━━━━━━━━━━━━━━
• No one is currently online
• Or their privacy is enabled
━━━━━━━━━━━━━━━━━━`
        }, { quoted: m });
      }

      const onlineList = onlineUsers
        .map((jid, index) => `${index + 1}. 🟢 @${jid.split('@')[0]}`)
        .join('\n');

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(m.chat, {
        text:
`🟢 *ONLINE MEMBERS*
━━━━━━━━━━━━━━━━━━
👥 Total Online: *${onlineUsers.length}*

${onlineList}

━━━━━━━━━━━━━━━━━━
⚡ Powered by *Dml*`,
        mentions: onlineUsers
      }, { quoted: m });

    } catch (error) {
      console.error('ListOnline error:', error);

      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      await client.sendMessage(m.chat, {
        text:
`⚠️ *SYSTEM ERROR*
━━━━━━━━━━━━━━━━━━
• Failed to fetch online users
• Reason: ${error.message || 'Unknown'}
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }
  }
};
