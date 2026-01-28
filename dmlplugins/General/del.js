const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

// Reusable function to delete a message
async function deleteRepliedMessage(client, m, deleteKey) {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const isGroup = m.key.remoteJid.endsWith('@g.us');

    if (!deleteKey) throw new Error('NO_QUOTED_MESSAGE');

    // Check permissions
    if (!isGroup && !deleteKey.fromMe) throw new Error('DM_NOT_BOT_MESSAGE');

    if (isGroup && !deleteKey.fromMe) {
        const meta = await client.groupMetadata(m.key.remoteJid);
        const botIsAdmin = meta.participants
            .filter(p => p.admin)
            .some(p => p.id === botJid);
        if (!botIsAdmin) throw new Error('BOT_NOT_ADMIN');
    }

    // Delete message
    await client.sendMessage(m.key.remoteJid, { delete: deleteKey });
}

module.exports = {
    name: 'del',
    aliases: ['delete', 'd'],
    description: 'Deletes the replied-to or quoted message with confirmation buttons',
    run: async (context) => {
        const { client, m, botname } = context;

        if (!botname) return m.reply('Bot error: No botname found in context.');

        try {
            // Identify message to delete
            let deleteKey = null;
            let quotedSender = null;

            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const ctx = m.message.extendedTextMessage.contextInfo;
                deleteKey = {
                    remoteJid: ctx.remoteJid || m.key.remoteJid,
                    id: ctx.stanzaId,
                    fromMe: ctx.participant === client.user.id.split(':')[0] + '@s.whatsapp.net',
                    participant: ctx.participant
                };
                quotedSender = ctx.participant;
            } else if (m.quoted && m.quoted.message) {
                deleteKey = {
                    remoteJid: m.quoted.key.remoteJid,
                    id: m.quoted.key.id,
                    fromMe: m.quoted.fromMe,
                    participant: m.quoted.key.participant || m.quoted.sender
                };
                quotedSender = m.quoted.sender;
            } else {
                return m.reply('Please reply to or quote a message to delete.');
            }

            // Send confirmation buttons
            const confirmMsg = generateWAMessageFromContent(
                m.chat,
                {
                    interactiveMessage: {
                        body: { text: 'Do you really want to delete this message?' },
                        footer: { text: `Bot: ${botname}` },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Confirm Delete',
                                        sections: [
                                            {
                                                rows: [
                                                    { title: '✅ Yes', description: 'Delete this message', id: `del_yes_${deleteKey.id}` },
                                                    { title: '❌ No', description: 'Cancel delete', id: `del_no_${deleteKey.id}` }
                                                ]
                                            }
                                        ]
                                    })
                                }
                            ]
                        }
                    }
                },
                { quoted: m }
            );

            await client.relayMessage(m.chat, confirmMsg.message, { messageId: confirmMsg.key.id });

            // Listen for button responses
            client.ev.on('messages.upsert', async (msgUpsert) => {
                const msg = msgUpsert.messages[0];
                if (!msg.message?.buttonsResponseMessage) return;

                const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;

                if (buttonId === `del_yes_${deleteKey.id}`) {
                    try {
                        await deleteRepliedMessage(client, m, deleteKey);
                        await client.sendMessage(m.chat, { text: 'Message deleted successfully.' });
                    } catch (err) {
                        if (err.message === 'BOT_NOT_ADMIN') {
                            await client.sendMessage(m.chat, {
                                text: `I am not an admin and cannot delete @${quotedSender.split('@')[0]}'s message.`,
                                mentions: [quotedSender]
                            });
                        } else if (err.message === 'DM_NOT_BOT_MESSAGE') {
                            await client.sendMessage(m.chat, { text: 'Cannot delete a DM from another user.' });
                        } else {
                            console.error('Delete error:', err);
                            await client.sendMessage(m.chat, { text: 'Failed to delete the message.' });
                        }
                    }
                } else if (buttonId === `del_no_${deleteKey.id}`) {
                    await client.sendMessage(m.chat, { text: 'Delete canceled.' });
                }
            });

        } catch (error) {
            console.error('Del command error:', error);
            await m.reply('Failed to process delete command. Please try again later.');
        }
    }
};
