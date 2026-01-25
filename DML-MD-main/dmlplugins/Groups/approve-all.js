module.exports = async (context) => {
  const { client, m, chatUpdate, store, isBotAdmin, isAdmin } = context;

  if (!m.isGroup) {
    return m.reply(
`╭─〔 ⚠️ Group Only 〕─╮
│ This command can only be used in groups.
│ Please run it inside a group chat.
╰────────────────────╯`
    );
  }

  if (!isAdmin) {
    return m.reply(
`╭─〔 🔐 Admin Required 〕─╮
│ You need to be a group admin
│ to use this command.
╰──────────────────╯`
    );
  }

  if (!isBotAdmin) {
    return m.reply(
`╭─〔 🤖 Bot Permission 〕─╮
│ I need admin rights to
│ approve join requests.
│ Make me admin first.
╰──────────────╯`
    );
  }

  const responseList = await client.groupRequestParticipantsList(m.chat);

  if (responseList.length === 0) {
    return m.reply(
`╭─〔 ℹ️ No Requests 〕─╮
│ There are no pending
│ join requests right now.
╰────────────────╯`
    );
  }

  for (const participant of responseList) {
    try {
      const response = await client.groupRequestParticipantsUpdate(
        m.chat,
        [participant.jid],
        "approve"
      );
      console.log(response);
    } catch (error) {
      console.error('Error approving participant:', error);
      return m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to approve:
│ @${participant.jid.split('@')[0]}
╰───────────────╯`,
        { mentions: [participant.jid] }
      );
    }
  }

  m.reply(
`╭─〔 ✅ Done 〕─╮
│ All pending join requests
│ have been approved successfully.
╰─────────────────────╯`
  );
};
