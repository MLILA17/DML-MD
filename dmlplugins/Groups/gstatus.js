const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
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
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  );
}

function getQuotedMessage(m) {
  const quoted =
    m.quoted ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    null;

  if (quoted?.message) return quoted.message;
  if (quoted?.msg) return quoted.msg;
  return quoted;
}

function getMediaInfo(message) {
  if (!message) return null;

  const msg = message.message ? message.message : message;

  if (msg.imageMessage) {
    return {
      type: 'image',
      message: msg.imageMessage,
      mime: msg.imageMessage.mimetype || 'image/jpeg'
    };
  }

  if (msg.videoMessage) {
    return {
      type: 'video',
      message: msg.videoMessage,
      mime: msg.videoMessage.mimetype || 'video/mp4'
    };
  }

  if (msg.audioMessage) {
    return {
      type: 'audio',
      message: msg.audioMessage,
      mime: msg.audioMessage.mimetype || 'audio/mp4'
    };
  }

  if (msg.documentMessage) {
    const mime = msg.documentMessage.mimetype || '';

    if (mime.startsWith('image/')) {
      return { type: 'image', message: msg.documentMessage, mime };
    }

    if (mime.startsWith('video/')) {
      return { type: 'video', message: msg.documentMessage, mime };
    }

    if (mime.startsWith('audio/')) {
      return { type: 'audio', message: msg.documentMessage, mime };
    }
  }

  return null;
}

async function streamToBuffer(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function downloadMedia(client, m, mediaInfo) {
  if (!mediaInfo) {
    throw new Error('No supported media found.');
  }

  if (m.quoted?.download && typeof m.quoted.download === 'function') {
    const buffer = await m.quoted.download();

    if (buffer && Buffer.isBuffer(buffer)) {
      return buffer;
    }
  }

  if (client.downloadMediaMessage && typeof client.downloadMediaMessage === 'function') {
    try {
      const buffer = await client.downloadMediaMessage(m);

      if (buffer && Buffer.isBuffer(buffer)) {
        return buffer;
      }
    } catch (_) {}
  }

  const stream = await downloadContentFromMessage(
    mediaInfo.message,
    mediaInfo.type === 'audio' ? 'audio' : mediaInfo.type
  );

  return streamToBuffer(stream);
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
      botname = 'DML-MINBOT'
    } = context;

    const chat = m.chat || m.key?.remoteJid;
    const sender = m.sender || m.key?.participant || m.key?.remoteJid;

    const formatMsg = (text) =>
`╭─〔 📢 Group Status 〕─╮
│ ${String(text).replace(/\n/g, '\n│ ')}
╰───────────────────╯`;

    const reply = async (text) => {
      if (client.sendText && typeof client.sendText === 'function') {
        return client.sendText(chat, formatMsg(text), m);
      }

      return client.sendMessage(
        chat,
        { text: formatMsg(text) },
        { quoted: m }
      );
    };

    const react = async (emoji) => {
      if (!m.key) return;

      return client.sendMessage(chat, {
        react: {
          text: emoji,
          key: m.key
        }
      }).catch(() => {});
    };

    try {
      if (!chat || !chat.endsWith('@g.us')) {
        return reply('This command can only be used in group chats.');
      }

      const groupCheck = IsGroup ?? isGroup ?? chat.endsWith('@g.us');

      if (!groupCheck) {
        return reply('This command can only be used in group chats.');
      }

      if (!sender || typeof sender !== 'string') {
        return reply('Could not identify your WhatsApp ID.\nPlease try again.');
      }

      if (!isBotAdmin) {
        return reply('I need to be an admin to post a group status.\nPlease make me admin first.');
      }

      const settings = await getSettings().catch(() => null);

      if (!settings) {
        return reply('Failed to load settings.\nPlease try again later.');
      }

      const body = getBody(m);

      const commandRegex = new RegExp(
        `^${escapeRegex(prefix)}(gstatus|groupstatus|gs)\\s*`,
        'i'
      );

      const caption = body.replace(commandRegex, '').trim();

      const quotedMessage = getQuotedMessage(m);
      const currentMessage = m.message || null;

      const mediaInfo =
        getMediaInfo(quotedMessage) ||
        getMediaInfo(currentMessage);

      if (!mediaInfo && !caption) {
        return reply(
          `Please reply to an image, video, or audio,\nor include text with the command.\n\nExample:\n${prefix}gstatus Check out this update!`
        );
      }

      const defaultCaption =
`Group status posted successfully ✅

JOIN:
https://chat.whatsapp.com/HflwxRda15o0kRMJwsggcD`;

      await react('⌛');

      const statusOptions = {
        statusJidList: [chat]
      };

      if (mediaInfo?.type === 'image') {
        const buffer = await downloadMedia(client, m, mediaInfo);

        await client.sendMessage(
          'status@broadcast',
          {
            image: buffer,
            caption: caption || defaultCaption,
            mimetype: mediaInfo.mime
          },
          statusOptions
        );

        await react('✅');
        return reply('Image group status has been posted successfully.');
      }

      if (mediaInfo?.type === 'video') {
        const buffer = await downloadMedia(client, m, mediaInfo);

        await client.sendMessage(
          'status@broadcast',
          {
            video: buffer,
            caption: caption || defaultCaption,
            mimetype: mediaInfo.mime
          },
          statusOptions
        );

        await react('✅');
        return reply('Video group status has been posted successfully.');
      }

      if (mediaInfo?.type === 'audio') {
        const buffer = await downloadMedia(client, m, mediaInfo);

        await client.sendMessage(
          'status@broadcast',
          {
            audio: buffer,
            mimetype: mediaInfo.mime || 'audio/mp4',
            ptt: false
          },
          statusOptions
        );

        await react('✅');
        return reply('Audio group status has been posted successfully.');
      }

      if (caption) {
        await client.sendMessage(
          'status@broadcast',
          {
            text: caption,
            backgroundColor: '#111827',
            font: 1
          },
          statusOptions
        );

        await react('✅');
        return reply('Text group status has been posted successfully.');
      }
    } catch (error) {
      console.error('GStatus Error:', error);

      await react('❌');

      return reply(
        `An error occurred while posting the status:\n${error.message || error}`
      );
    }
  }
};

// dml
