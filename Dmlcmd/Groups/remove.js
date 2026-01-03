const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, botNumber } = context;

    // Log message context for debugging
    console.log(`Kick command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);

    // Check if a user is mentioned or quoted
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Yo, dumbass, mention a user or quote their message! Don’t make me guess.`);
    }

    // Get the target user (mentioned or quoted)
    const users = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
    if (!users) {
      console.error(`No valid user found: mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ What the hell? No user found. Tag or quote someone, idiot.`);
    }

    // Validate JID format
    if (
      typeof users !== 'string' ||
      (!users.includes('@s.whatsapp.net') && !users.includes('@lid'))
    ) {
      console.error(`Invalid JID format: ${users}`);
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Invalid user format. Tag a valid user, you moron.`);
    }

    // Extract phone number part from JID
    const parts = users.split('@')[0];
    if (!parts) {
      console.error(`Failed to extract number from JID: ${users}`);
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Something’s fucked up with that user’s ID. Try again, idiot.`);
    }

    // Prevent kicking the bot itself
    if (users === botNumber) {
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Nice try, loser, you can’t kick me! I’m the boss here. 🦄`);
    }

    try {
      // Attempt to remove the user from the group
      await client.groupParticipantsUpdate(m.chat, [users], 'remove');
      await m.reply(
        `◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ @${parts} got yeeted from the group! Good riddance, trash. 🚫`,
        { mentions: [users] }
      );
    } catch (error) {
      console.error(`Error in kick command: ${error.stack}`);
      await m.reply(
        `◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Shit went wrong, couldn’t kick @${parts}. Maybe I’m not admin? Fix it, moron.`,
        { mentions: [users] }
      );
    }
  });
};