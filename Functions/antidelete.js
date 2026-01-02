const { getSettings, updateSetting } = require('../Database/config');
const { proto, getContentType, generateWAMessageID } = require('@whiskeysockets/baileys');

module.exports = async (context) => {
  const { client, m, args, settings, store } = context;

  const formatStylishReply = (message) => {
    return `╭┈┈┈┈━━━━━━┈┈┈┈◈n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
  };

  try {
    if (!m || !m.key || !m.key.remoteJid || !m.key.id) {
      console.log("⚠️ Skipping antidelete: invalid message object");
      return;
    }

    console.log(`Antidelete command: Chat=${m.key?.remoteJid || 'unknown'}, Sender=${m.sender || 'unknown'}`);

    const myself = client.decodeJid(client.user.id);
    if (!m.key.fromMe) {
      return await m.reply(formatStylishReply("Only the bot owner can toggle antidelete, loser! 🖕"));
    }

    const subCommand = args[0]?.toLowerCase();

    if (subCommand === 'status') {
      const isEnabled = settings.antidelete;
      return await m.reply(formatStylishReply(
        `🔍 *Anti-Delete Status*\n\n` +
        `• Enabled: ${isEnabled ? '✅ Yes' : '❌ No'}\n` +
        `• Forwards to: Bot's DM`
      ));
    }

    const newState = !settings.antidelete;
    await updateSetting('antidelete', newState);
    await m.reply(formatStylishReply(`Antidelete ${newState ? 'ENABLED' : 'DISABLED'} globally! ${newState ? 'Deleted messages will be forwarded to my DM! 🔒' : 'No more snooping on deletes, you rebel! 😎'}`));
  } catch (error) {
    console.error(`Error in antidelete: ${error}`);
  }

  client.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || !msg.key || !msg.key.remoteJid || !msg.key.id) {
      console.log("⚠️ Skipping invalid message in antidelete listener");
      return;
    }

    const settings = await getSettings();
    if (!settings.antidelete) return;

    if (msg.message?.protocolMessage?.type === 0) {
      const deletedP = msg.message.protocolMessage.key;
      const deletedM = await store.loadMessage(msg.key.remoteJid, deletedP.id);
      if (!deletedM) {
        console.log(`⚠️ No stored message found for ID ${deletedP.id} in ${msg.key.remoteJid}`);
        return;
      }

      const botJid = client.decodeJid(client.user.id);
      const sender = client.decodeJid(deletedP.participant || deletedP.remoteJid);
      if (sender === botJid) return;

      try {
        deletedM.message = {
          [deletedM.mtype || "msg"]: deletedM?.msg
        };

        const M = proto.WebMessageInfo;
        const forwardedMsg = M.fromObject(M.toObject(deletedM));

        const isGroup = deletedP.remoteJid.endsWith('@g.us');
        const messageType = getContentType(deletedM.message);
        const caption = `⚠️ *Anti-Delete Detection*\n\n` +
                      `• From: @${sender.split('@')[0]}\n` +
                      `• Chat: ${isGroup ? 'Group' : 'Private'}\n` +
                      `• Type: ${messageType}\n` +
                      `• Time: ${new Date(deletedM.messageTimestamp * 1000).toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}\n\n` +
                      `*Original Message:*`;

        await client.sendMessage(botJid, {
          text: caption,
          mentions: [sender]
        });

        await client.relayMessage(botJid, forwardedMsg.message, {
          messageId: generateWAMessageID()
        });

        console.log(`Forwarded deleted ${messageType} message ${deletedP.id} from ${deletedP.remoteJid} to ${botJid}`);
      } catch (error) {
        console.error(`Error forwarding deleted message ${deletedP.id}: ${error}`);
        await client.sendMessage(botJid, { text: `⚠️ Error forwarding deleted message: ${error.message}` });
      }
    }
  });
};