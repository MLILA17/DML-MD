const { getSettings } = require('../../Database/config');

/**
 * Status preparation command for private chat only
 * @module status
 */
module.exports = {
  name: 'status',
  aliases: ['st'],
  description: 'Prepare status updates in private chat',
  
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;

    // Private chat only - reject groups
    if (IsGroup) {
      return client.sendText(
        m.chat,
        '📱 *Private Chat Only*\nThis command works only in direct message with me.',
        m
      );
    }

    // Formatting helper
    const formatMsg = (text) =>
`╭─〔 📢 Status 〕─╮
│ ${text.replace(/\n/g, '\n│ ')}
╰─────────────────╯`;

    try {
      if (!botname) {
        return client.sendText(
          m.chat,
          formatMsg('Bot configuration incomplete.\nContact bot owner.'),
          m
        );
      }

      const settings = await getSettings();
      if (!settings) {
        return client.sendText(
          m.chat,
          formatMsg('Failed to load settings.'),
          m
        );
      }

      // Check for media/text
      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      const caption = m.body
        .replace(new RegExp(`^${prefix}(status|st)\\s*`, 'i'), '')
        .trim();

      // Help message if no content
      if (!/image|video|audio/.test(mime) && !caption) {
        return client.sendText(
          m.chat,
          formatMsg(
            `*HOW TO PREPARE STATUS*\n\n` +
            `Send me media or text, then use ${prefix}status\n\n` +
            `*Examples:*\n` +
            `Send image → ${prefix}status "Look at this!"\n` +
            `Send video → ${prefix}status\n` +
            `Type text → ${prefix}status Hello everyone!\n\n` +
            `I'll save it for later use.`
          ),
          m
        );
      }

      // Save the content
      const userStatus = {
        type: '',
        caption: caption || '',
        timestamp: Date.now(),
        sender: m.sender
      };

      let responseMessage = '';

      // Handle different media types
      if (/image/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        userStatus.type = 'image';
        userStatus.media = buffer;
        userStatus.mime = 'image/jpeg';
        responseMessage = '✅ Image saved for status!';

      } else if (/video/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        userStatus.type = 'video';
        userStatus.media = buffer;
        userStatus.mime = 'video/mp4';
        responseMessage = '✅ Video saved for status!';

      } else if (/audio/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        userStatus.type = 'audio';
        userStatus.media = buffer;
        userStatus.mime = 'audio/mp4';
        responseMessage = '✅ Audio saved for status!';

      } else if (caption) {
        userStatus.type = 'text';
        responseMessage = `✅ Text status saved!\n"${caption.substring(0, 50)}${caption.length > 50 ? '...' : ''}"`;
      }

      // Save to storage
      userStatusStorage.set(m.sender, userStatus);

      // Send confirmation
      await client.sendText(
        m.chat,
        formatMsg(responseMessage + '\n\nYour status is now saved.'),
        m
      );

    } catch (error) {
      await client.sendText(
        m.chat,
        formatMsg(`Error: ${error.message}`),
        m
      );
    }
  }
};

// Simple in-memory storage
const userStatusStorage = new Map();
