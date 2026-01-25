const middleware = require('../../utility/botUtil/middleware');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'demote',
  aliases: ['unadmin', 'removeadmin'],
  description: 'Demotes a user from admin in a group',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, botname, prefix } = context;

      // =================ABOUT DML=================
      const formatStylishReply = (message) => {
        return `╔═══════════════✦✦\n║ ❒ ${message}\n╚═══════════════✦✦\n➤ ©${botname || 'BOT'}`;
      };
      // ================================================================

      if (!botname) {
        console.error('Dml-md: Botname not set in context');
        return m.reply(
          formatStylishReply(`Sorry ${m.pushName}, the bot is not fully configured. Please contact the developer.`)
        );
      }

      if (!m.isGroup) {
        console.log(`Dml-md: Demote command attempted in non-group chat by ${m.sender}`);
        return m.reply(
          formatStylishReply(`Hello ${m.pushName}, this command works only in groups. Use ${prefix}demote in a group chat.`)
        );
      }

      // Fetch group metadata
      let groupMetadata;
      try {
        groupMetadata = await client.groupMetadata(m.chat);
      } catch (e) {
        console.error(`Dml-md: Error fetching group metadata: ${e.stack}`);
        return m.reply(
          formatStylishReply(`Sorry ${m.pushName}, could not retrieve group data: ${e.message}. Please try again later.`)
        );
      }

      const members = groupMetadata.participants;
      const admins = members
        .filter((p) => p.admin != null)
        .map((p) => p.id.split(':')[0]);
      const botId = client.user.id.split(':')[0];

      if (!admins.includes(botId)) {
        console.log(`Dml-md: Bot ${botId} is not admin in ${m.chat}`);
        return m.reply(
          formatStylishReply(`I am not an admin in this group, ${m.pushName}. Please make me admin to use this command.`)
        );
      }

      // Check for mentioned or quoted user
      if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        console.log(`Dml-md: No user mentioned or quoted for demote by ${m.pushName}`);
        return m.reply(
          formatStylishReply(`Please mention or reply to the user you want to demote. Example: ${prefix}demote @username`)
        );
      }

      const user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user) {
        console.log(`Dml-md: Invalid user for demote in ${m.chat}`);
        return m.reply(
          formatStylishReply(`No valid user detected. Please try again and mention the correct user.`)
        );
      }

      const userNumber = user.split('@')[0];
      const userName =
        m.mentionedJid[0]
          ? members.find((p) => p.id.split(':')[0] === user.split(':')[0])?.name || userNumber
          : m.quoted?.pushName || userNumber;

      // Protect the owner
      const settings = await getSettings();
      const ownerNumber = settings.owner || '255622220680@s.whatsapp.net';
      if (user.split(':')[0] === ownerNumber.split(':')[0]) {
        console.log(`Dml-md: Attempt to demote owner ${user} by ${m.pushName}`);
        return m.reply(
          formatStylishReply(`You cannot demote the group owner, ${m.pushName}. This action is restricted.`)
        );
      }

      // Check if user is admin
      if (!admins.includes(user.split(':')[0])) {
        console.log(`Dml-md: User ${userName} (${user}) is not admin in ${m.chat}`);
        return m.reply(
          formatStylishReply(`${userName} is not an admin in this group.`)
        );
      }

      // Demote user
      try {
        await client.groupParticipantsUpdate(m.chat, [user], 'demote');
        console.log(`Dml-md: Successfully demoted ${userName} (${user}) in ${m.chat}`);
        await m.reply(
          formatStylishReply(`Successfully demoted ${userName}. They no longer have admin privileges.`),
          { mentions: [user] }
        );
      } catch (error) {
        console.error(`Dml-md: Demote command error: ${error.stack}`);
        await m.reply(
          formatStylishReply(`Could not demote ${userName}: ${error.message}. Please try again later.`)
        );
      }
    });
  },
};
