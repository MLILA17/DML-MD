const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'status',
  
  run: async (context) => {
    const { client, m, prefix, IsGroup } = context;

    // Private chat only
    if (IsGroup) return;

    try {
      const quoted = m.quoted || m;
      const isMedia = quoted.mimetype?.match(/image|video|audio/);
      const text = m.body.slice(prefix.length).trim();

      if (!isMedia && !text) {
        return client.sendText(m.chat,
          `📱 *Post Your WhatsApp Status*\n\n` +
          `Send me what to post:\n\n` +
          `• Photo/video/audio + ${prefix}status\n` +
          `• Or just: ${prefix}status Your message\n\n` +
          `I'll post it as YOUR status.`,
          m
        );
      }

      // Post the status
      if (isMedia) {
        const media = await client.downloadMediaMessage(quoted);
        const caption = text || `Status via ${client.user.name}`;
        
        // Post to your status
        await client.sendMessage('status@broadcast', {
          [quoted.mimetype.includes('image') ? 'image' : 
           quoted.mimetype.includes('video') ? 'video' : 'audio']: media,
          caption: caption
        });
        
        client.sendText(m.chat, `✅ Posted to your status!`, m);
        
      } else {
        // Text status
        await client.sendMessage('status@broadcast', {
          text: text
        });
        
        client.sendText(m.chat, `✅ Text status posted: "${text}"`, m);
      }

    } catch (error) {
      client.sendText(m.chat, `❌ Failed: ${error.message}`, m);
    }
  }
};
