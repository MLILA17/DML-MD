const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, text, args, Owner, botname } = context;

    // Context validation
    if (!botname) {
      console.error('[JOIN-ERROR] botname missing in context');
      return m.reply(
        `╭──〔 ⚠️ SYSTEM ERROR ──╮
│ Bot name is missing in context.
│ Please contact the developer.
╰─────────────────────╯`
      );
    }

    if (!Owner) {
      console.error('[JOIN-ERROR] Owner missing in context');
      return m.reply(
        `╭─〔 ⚠️ SYSTEM ERROR 〕─╮
│ Owner information is missing.
│ Please contact the developer.
╰─────────────────────╯`
      );
    }

    // Get invite input
    let raw =
      (text && text.trim()) ||
      (m.quoted && (m.quoted.text || m.quoted.caption)) ||
      "";

    raw = String(raw).trim();

    if (!raw) {
      return m.reply(
        `╭──〔 📎 GROUP JOIN 〕──╮
│ Please provide a valid WhatsApp
│ group invite link or reply to one.
│
│ Example:
│ .join https://chat.whatsapp.com/xxxx
╰─────────────────────╯`
      );
    }

    // Extract invite code
    const urlRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;
    const match = raw.match(urlRegex);
    let inviteCode = match ? match[1] : null;

    if (!inviteCode) {
      const token = raw.split(/\s+/)[0];
      if (/^[A-Za-z0-9_-]{8,}$/.test(token)) {
        inviteCode = token;
      }
    }

    if (!inviteCode) {
      return m.reply(
        `╭─〔 ❌ INVALID INPUT 〕─╮
│ The provided link or code
│ is not a valid group invite.
╰────────────────────╯`
      );
    }

    inviteCode = inviteCode.replace(/\?.*$/, '').trim();

    try {
      // Fetch group info
      const info = await client.groupGetInviteInfo(inviteCode);
      const subject =
        info?.subject ||
        info?.groupMetadata?.subject ||
        'Unknown Group';

      // Join group
      await client.groupAcceptInvite(inviteCode);

      return m.reply(
        `╭─〔 ✅ JOIN SUCCESS 〕─╮
│ Group : ${subject}
│ Status: Successfully joined
│
│ Please follow group rules.
╰───── ${botname} ───────╯`
      );

    } catch (error) {
      console.error('[JOIN-ERROR]', inviteCode, error);

      const status =
        error?.output?.statusCode ||
        error?.statusCode ||
        error?.status ||
        error?.response?.status ||
        null;

      const errors = {
        400: 'Invalid or non-existent group invite.',
        401: 'Bot was previously removed from this group.',
        403: 'Permission denied to join this group.',
        404: 'Group does not exist.',
        409: 'Bot is already a member of this group.',
        410: 'Invite link has expired or was reset.',
        500: 'Group is full or server error occurred.',
      };

      if (errors[status]) {
        return m.reply(
          `╭──〔 ❌ JOIN FAILED 〕─╮
│ Reason: ${errors[status]}
╰──────────────────╯`
        );
      }

      return m.reply(
        `╭──〔 ❌ JOIN FAILED 〕──╮
│ An unexpected error occurred.
│ ${error.message || 'Unknown error'}
╰─────────────────────╯`
      );
    }
  });
};
// dml
