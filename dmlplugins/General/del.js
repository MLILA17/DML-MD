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
    description: 'Deletes the replied-to or quoted message silently',
    run: async (context) => {
        const { client, m } = context;

        try {
            let deleteKey = null;

            // Identify message to delete
            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const ctx = m.message.extendedTextMessage.contextInfo;
                deleteKey = {
                    remoteJid: ctx.remoteJid || m.key.remoteJid,
                    id: ctx.stanzaId,
                    fromMe: ctx.participant === client.user.id.split(':')[0] + '@s.whatsapp.net',
                    participant: ctx.participant
                };
            } else if (m.quoted && m.quoted.message) {
                deleteKey = {
                    remoteJid: m.quoted.key.remoteJid,
                    id: m.quoted.key.id,
                    fromMe: m.quoted.fromMe,
                    participant: m.quoted.key.participant || m.quoted.sender
                };
            } else {
                return; // No message replied/quoted, do nothing
            }

            // Delete silently
            await deleteRepliedMessage(client, m, deleteKey);

        } catch (err) {
            console.error('Delete error:', err);
            // Silent fail: don't send any message to chat
        }
    }
};
