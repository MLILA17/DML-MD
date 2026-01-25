const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, botNumber } = context;

    // Log message context for debugging
    console.log(
      `Kick command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`
    );

    // Check if a user is mentioned or quoted
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return m.reply(
`╭─〔 ⚠️ User Required 〕─╮
│ Mention a user or
│ reply to their message.
│ I can’t guess.
╰────────────────╯`
      );
    }

    // Get the target user (mentioned or quoted)
    const users = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
    if (!users) {
      console.error(
        `No valid user found: mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`
      );
      return m.reply(
`╭─〔 ❌ Error 〕─╮
│ No valid user found.
│ Please tag or quote
│ a group member.
╰─────────────╯`
      );
    }

    // Validate JID format
    if (
      typeof users !== 'string' ||
      (!users.includes('@s.whatsapp.net') && !users.includes('@lid'))
    ) {
      console.error(`Invalid JID format: ${users}`);
      return m.reply(
`╭─〔 ❌ Invalid User 〕─╮
│ Invalid user format.
│ Please mention a
│ valid WhatsApp user.
╰───────────────╯`
      );
    }

    // Extract phone number part from JID
    const parts = users.split('@')[0];
    if (!parts) {
      console.error(`Failed to extract number from JID: ${users}`);
      return m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to read the
│ user ID. Try again.
╰───────────╯`
      );
    }

    // Prevent kicking the bot itself
    if (users === botNumber) {
      return m.reply(
`╭─〔 🤖 Action Denied 〕─╮
│ You can’t remove me.
│ I’m the bot 😎
╰────────────────╯`
      );
    }

    try {
      // Attempt to remove the user from the group
      await client.groupParticipantsUpdate(m.chat, [users], 'remove');
      await m.reply(
`╭─〔 🚫 User Removed 〕─╮
│ @${parts} has been
│ removed from the group.
╰─────────────────╯`,
        { mentions: [users] }
      );
    } catch (error) {
      console.error(`Error in kick command: ${error.stack}`);
      await m.reply(
`╭─〔 ❌ Failed 〕─╮
│ Could not remove
│ @${parts}.
│ Make sure I’m admin.
╰─────────────╯`,
        { mentions: [users] }
      );
    }
  });
};
