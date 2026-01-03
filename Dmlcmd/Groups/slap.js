module.exports = {
  name: 'slap',
  aliases: ['smack', 'hit'],
  description: 'Slaps a tagged or quoted user with a toxic, realistic reaction',
  run: async (context) => {
    const { client, m } = context;

    try {
      // Log message context for debugging
      console.log(`Slap command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`);

      // Check if a user is tagged or quoted
      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Yo, dumbass, tag someone or quote a message to slap! I ain’t smacking thin air!`);
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
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Invalid user, idiot! Tag or quote a real person to slap!`);
      }

      // Extract phone numbers
      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];
      if (!targetNumber || !senderNumber) {
        console.error(`Failed to extract numbers: target=${targetUser}, sender=${m.sender}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Something’s fucked up with the user IDs. Try again, moron!`);
      }

      // Send slapping message with dramatic delay
      const slappingMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ @${senderNumber} is winding up to slap @${targetNumber}... 🖐️\n│❒ This is gonna sting, bitch!\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Random dramatic delay between 1-3 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate random slap intensity
      const intensities = [
        {
          level: 'Weak',
          description: 'a pathetic, limp-wristed tap that barely made @TARGET flinch! You call that a slap, @SENDER? Weak sauce!',
          emoji: '😴',
        },
        {
          level: 'Moderate',
          description: 'a solid smack that left a red mark on @TARGET’s face! @SENDER, you got some balls, but it’s still meh!',
          emoji: '🖐️',
        },
        {
          level: 'Epic',
          description: 'a thunderous SLAP that sent @TARGET flying across the room! @SENDER, you absolute savage, that was brutal!',
          emoji: '💥',
        },
      ];
      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      // Build the final toxic result message with proper interpolation
      const resultMsg = `╭┈┈┈┈━━━━━━┈┈┈┈◈
*SLAP REPORT* ${intensity.emoji}

*SLAPPER:* @${senderNumber}
*VICTIM:* @${targetNumber}
*INTENSITY:* ${intensity.level}

*VERDICT:* ${intensity.description.replace('@TARGET', `@${targetNumber}`).replace('@SENDER', `@${senderNumber}`)}

*DISCLAIMER:* This slap was 100% deserved, you pathetic loser! Cry about it! 😈
╰┈┈┈┈━━━━━━┈┈┈┈◈◈`;

      // Send the final result
      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Delete the slapping message for cleaner look
      if (slappingMsg && slappingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: slappingMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete slapping message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Slap command exploded: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Shit broke harder than your ego! Can’t slap right now, you unlucky fuck.`);
    }
  },
};