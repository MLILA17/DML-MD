const { getSettings } = require('../../Database/config');

/**
 * Posts a group status message with text, image, video, or audio.
 * @module gstatus
 */

function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBody(m) {
  return (
    m.body ||
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  );
}

function getMime(quoted) {
  return (
    quoted?.mimetype ||
    quoted?.msg?.mimetype ||
    quoted?.message?.imageMessage?.mimetype ||
    quoted?.message?.videoMessage?.mimetype ||
    quoted?.message?.audioMessage?.mimetype ||
    quoted?.imageMessage?.mimetype ||
    quoted?.videoMessage?.mimetype ||
    quoted?.audioMessage?.mimetype ||
    ''
  );
}

async function downloadMedia(client, quoted) {
  if (quoted?.download && typeof quoted.download === 'function') {
    return await quoted.download();
  }

  if (client.downloadMediaMessage && typeof client.downloadMediaMessage === 'function') {
    return await client.downloadMediaMessage(quoted);
  }

  throw new Error('Media download function is not available in this bot framework.');
}

module.exports = {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts a group status with text, image, video, or audio.',

  run: async (context) => {
    const {
      client,
      m,
      prefix = '.',
      isBotAdmin,
      IsGroup,
      isGroup,
      botname
    } = context;

    const formatMsg = (text) =>
`╭─〔 📢 Group Status 〕─╮
│ ${String(text).replace(/\n/g, '\n│ ')}
╰───────────────────╯`;

    const reply = async (text) => {
      if (client.sendText && typeof client.sendText === 'function') {
        return client.sendText(m.chat, formatMsg(text), m);
      }

      return client.sendMessage(
        m.chat,
        { text: formatMsg(text) },
        { quoted: m }
      );
    };

    try {
      if (!botname) {
        return reply(`Bot name is not set.\nPlease configure it before using this command.`);
      }

      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        return reply(`Could not identify your WhatsApp ID.\nPlease try again.`);
      }

      const groupCheck = IsGroup ?? isGroup;

      if (!groupCheck) {
        return reply(`This command can only be used in group chats.`);
      }

      if (!isBotAdmin) {
        return reply(`I need to be an admin to post a group status.\nPlease make me admin first.`);
      }

      const settings = await getSettings();

      if (!settings) {
        return reply(`Failed to load settings.\nPlease try again later.`);
      }

      const quoted = m.quoted || m;
      const mime = getMime(quoted);
      const body = getBody(m);

      const commandRegex = new RegExp(
        `^${escapeRegex(prefix)}(gstatus|groupstatus|gs)\\s*`,
        'i'
      );

      const caption = body.replace(commandRegex, '').trim();

      if (!/image|video|audio/i.test(mime) && !caption) {
        return reply(
          `Please reply to an image, video, or audio,\nor include text with the command.\n\nExample:\n${prefix}gstatus Check out this update!`
        );
      }

      const defaultCaption =
`Group status posted successfully ✅

JOIN:
https://chat.whatsapp.com/HflwxRda15o0kRMJwsggcD`;

      await client.sendMessage(m.chat, {
        react: { text: '⌛', key: m.key }
      });

      if (/image/i.test(mime)) {
        const buffer = await downloadMedia(client, quoted);

        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            image: buffer,
            caption: caption || defaultCaption
          }
        });

        await client.sendMessage(m.chat, {
          react: { text: '✅', key: m.key }
        });

        return reply(`Image status has been posted successfully.`);

      } else if (/video/i.test(mime)) {
        const buffer = await downloadMedia(client, quoted);

        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            video: buffer,
            caption: caption || defaultCaption
          }
        });

        await client.sendMessage(m.chat, {
          react: { text: '✅', key: m.key }
        });

        return reply(`Video status has been posted successfully.`);

      } else if (/audio/i.test(mime)) {
        const buffer = await downloadMedia(client, quoted);

        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            audio: buffer,
            mimetype: mime || 'audio/mp4'
          }
        });

        await client.sendMessage(m.chat, {
          react: { text: '✅', key: m.key }
        });

        return reply(`Audio status has been posted successfully.`);

      } else if (caption) {
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            text: caption
          }
        });

        await client.sendMessage(m.chat, {
          react: { text: '✅', key: m.key }
        });

        return reply(`Text status has been posted successfully.`);
      }

    } catch (error) {
      console.error('GStatus Error:', error);

      await client.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      }).catch(() => {});

      return reply(`An error occurred while posting the status:\n${error.message}`);
    }
  }
};

// dml
