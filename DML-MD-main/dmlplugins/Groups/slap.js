module.exports = {
  name: 'slap',
  aliases: ['smack', 'hit'],
  description: 'Slaps a tagged or quoted user with a toxic, realistic reaction',
  run: async (context) => {
    const { client, m } = context;

    try {
      // Log message context for debugging
      console.log(
        `Slap command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
      );

      // Check if a user is tagged or quoted
      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(
`╭─〔 ⚠️ Target Required 〕─╮
│ Tag someone or reply
│ to their message.
│ I’m not slapping air.
╰─────────────────╯`
          );
        }
      }

      // Get the target user (tagged or quoted)
      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      // Validate target user
      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(
`╭─〔 ❌ Invalid User 〕─╮
│ Tag or quote a real
│ WhatsApp user to slap.
╰───────────────╯`
        );
      }

      // Extract phone numbers
      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];
      if (!targetNumber || !senderNumber) {
        console.error(`Failed to extract numbers: target=${targetUser}, sender=${m.sender}`);
        return m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to read user
│ IDs. Try again.
╰───────────╯`
        );
      }

      // Send slapping message with dramatic delay
      const slappingMsg = await client.sendMessage(
        m.chat,
        {
          text:
`╭─〔 🖐️ Incoming Slap 〕─╮
│ @${senderNumber} is
│ winding up to slap
│ @${targetNumber}...
│
│ This will hurt 😈
╰─────────────────╯`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Random dramatic delay between 1–3 seconds
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Random slap intensity
      const intensities = [
        {
          level: 'Weak',
          description:
            'a pathetic, limp-wristed tap that barely made @TARGET flinch! @SENDER, that was embarrassing.',
          emoji: '😕',
        },
        {
          level: 'Moderate',
          description:
            'a solid smack that left a red mark on @TARGET’s face! @SENDER came prepared.',
          emoji: '🖐️',
        },
        {
          level: 'Epic',
          description:
            'a thunderous SLAP that sent @TARGET flying! Absolute violence by @SENDER.',
          emoji: '💥',
        },
      ];

      const intensity =
        intensities[Math.floor(Math.random() * intensities.length)];

      // Final result message
      const resultMsg =
`╭─〔 💢 SLAP REPORT 〕─╮
│ ${intensity.emoji}
│
│ Slapper : @${senderNumber}
│ Victim  : @${targetNumber}
│ Power   : ${intensity.level}
│
│ Verdict :
│ ${intensity.description
        .replace('@TARGET', `@${targetNumber}`)
        .replace('@SENDER', `@${senderNumber}`)}
│
│ ⚠️ This slap was
│ absolutely deserved.
╰──────────────────╯`;

      // Send result
      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Delete the slapping message
      if (slappingMsg && slappingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: slappingMsg.key });
        } catch (deleteError) {
          console.error(
            `Failed to delete slapping message: ${deleteError.stack}`
          );
        }
      }
    } catch (error) {
      console.error(`Slap command exploded: ${error.stack}`);
      await m.reply(
`╭─〔 ❌ Error 〕─╮
│ Slap failed badly.
│ Try again later.
╰───────────╯`
      );
    }
  },
};
