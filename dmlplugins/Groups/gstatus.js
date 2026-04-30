const { getSettings } = require('../../Database/config');

/**
 * Posts a group status message with text, image, video, or audio.
 * @module gstatus
 */
module.exports = {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts a group status with text, image, video, or audio.',
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, botname } = context;

    // Helper to wrap all replies with new clean styling
    const formatMsg = (text) =>
`╭─〔 📢 Group Status 〕─╮
│ ${text.replace(/\n/g, '\n│ ')}
╰───────────────────╯`;

    try {
      if (!botname) {
        return client.sendText(
          m.chat,
          formatMsg(`Bot name is not set.\nPlease configure it before using this command.`),
          m
        );
      }

      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        return client.sendText(
          m.chat,
          formatMsg(`Could not identify your WhatsApp ID.\nPlease try again.`),
          m
        );
      }

      if (!IsGroup) {
        return client.sendText(
          m.chat,
          formatMsg(`This command can only be used in group chats.`),
          m
        );
      }

      if (!isBotAdmin) {
        return client.sendText(
          m.chat,
          formatMsg(`I need to be an admin to post a group status.\nPlease make me admin first.`),
          m
        );
      }

      const settings = await getSettings();
      if (!settings) {
        return client.sendText(
          m.chat,
          formatMsg(`Failed to load settings.\nPlease try again later.`),
          m
        );
      }

      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      const caption = m.body
        .replace(new RegExp(`^${prefix}(gstatus|groupstatus|gs)\\s*`, 'i'), '')
        .trim();

      if (!/image|video|audio/.test(mime) && !caption) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Please reply to an image, video, or audio,\nor include text with the command.\n\nExample:\n${prefix}gstatus Check out this update!`
          ),
          m
        );
      }

      // Default caption for group status
      const defaultCaption =
`Group status posted successfully ✅

JOIN:
https://chat.whatsapp.com/HflwxRda15o0kRMJwsggcD`;

      // Handle media types
      if (/image/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            image: buffer,
            caption: caption || defaultCaption
          }
        });
        await client.sendText(m.chat, formatMsg(`Image status has been posted successfully.`), m);

      } else if (/video/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            video: buffer,
            caption: caption || defaultCaption
          }
        });
        await client.sendText(m.chat, formatMsg(`Video status has been posted successfully.`), m);

      } else if (/audio/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            audio: buffer,
            mimetype: 'audio/mp4'
          }
        });
        await client.sendText(m.chat, formatMsg(`Audio status has been posted successfully.`), m);

      } else if (caption) {
        await client.sendMessage(m.chat, {
          groupStatusMessage: { text: caption }
        });
        await client.sendText(m.chat, formatMsg(`Text status has been posted successfully.`), m);
      }

    } catch (error) {
      await client.sendText(
        m.chat,
        formatMsg(`An error occurred while posting the status:\n${error.message}`),
        m
      );
    }
  }
};
//dml
