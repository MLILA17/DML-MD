module.exports = {
  name: 'gaycheck',
  aliases: ['gaymeter', 'gcheck', 'howgay'],
  description: 'Checks gay percentage with toxic, violent, and realistic roasts',
  run: async (context) => {
    const { client, m } = context;

    try {
      let targetUser = null;
      let targetNumber = null;

      // Determine target user
      if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0];
      } else if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender;
      } else {
        targetUser = m.sender;
      }

      // Validate target
      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        return m.reply(`
╔═══════════════╗
║ ⚠️  ERROR
╚═══════════════╝
Tag someone or reply to a message first.
`);
      }

      targetNumber = targetUser.split('@')[0];
      if (!targetNumber) {
        return m.reply(`
╔═══════════════╗
║ ⚠️  ERROR
╚═══════════════╝
Invalid user detected.
`);
      }

      // Loading / checking message
      const checkingMsg = await client.sendMessage(
        m.chat,
        {
          text: `
╭─── 🧪 GAY METER ───╮
│ Target : @${targetNumber}
│ Status : Scanning vibes 🌈
│ Please wait...
╰──────────────────╯
`,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      const percentage = Math.floor(Math.random() * 101);

      let roast;
      let emoji;

      // Roast logic (UNCHANGED)
      if (percentage === 0) {
        roast = "STRAIGHTER THAN A FUCKING RULER! You’re so dull you make cardboard look spicy, you basic-ass rock!";
        emoji = "🚫🏳️‍🌈";
      } else if (percentage <= 2) {
        roast = "NOT A HINT OF GAY! You’re so straight you’d get lost in a pride parade, you clueless troglodyte!";
        emoji = "📏";
      } else if (percentage <= 4) {
        roast = "ZERO SPARKS! You’re straighter than a flatline, you boring-ass zombie!";
        emoji = "😴";
      } else if (percentage <= 6) {
        roast = "BARELY A PULSE! You’re so straight you’d trip over a rainbow and sue it, you pathetic drone!";
        emoji = "🪨";
      } else if (percentage <= 8) {
        roast = "FAINT WHIFF OF CURIOUSITY! You’ve glanced at someone’s ass once and panicked, you spineless worm!";
        emoji = "👀";
      } else if (percentage <= 10) {
        roast = "TINY FLICKER! You’ve thought ‘nice jawline’ and then cried about it, you repressed fuck!";
        emoji = "💡";
      } else if (percentage <= 20) {
        roast = "TEETERING ON THE EDGE! You’re one rom-com away from a full identity crisis, you chaotic dumbass!";
        emoji = "🧭";
      } else if (percentage <= 40) {
        roast = "SOLID RAINBOW ENERGY! You’re out here winking at everyone, you shameless flirt!";
        emoji = "😉";
      } else if (percentage <= 60) {
        roast = "RAINBOW ROYALTY! You’re ruling the queer scene with zero chill, you majestic bastard!";
        emoji = "👑";
      } else if (percentage <= 80) {
        roast = "GAY ICON STATUS! You’re shining brighter than a disco ball, you fabulous menace!";
        emoji = "🪩";
      } else {
        roast = "ABSOLUTE GAY COSMIC EMPEROR! You’ve transcended all known sexuality and invented new dimensions of fabulous, you unstoppable rainbow god!";
        emoji = "🌌👑💥";
      }

      // Insults (UNCHANGED)
      let insult = "";
      if (percentage < 20) {
        insult = " Go choke on your boring life, you irrelevant speck of lint!";
      } else if (percentage > 80) {
        insult = " The universe bows to your fabulousness, you untouchable rainbow deity!";
      } else {
        const insults = [
          " You’re a walking trash fire!",
          " Your life’s a bigger flop than a dollar store wig!",
          " Even your shadow thinks you’re a loser!",
          " You’re the human equivalent of expired milk!",
          " Your existence is a cosmic typo!",
        ];
        insult = insults[Math.floor(Math.random() * insults.length)];
      }

      // Final styled result
      const resultMsg = `
╔══════════════════════╗
║ 🌈  GAY CHECK RESULT
╚══════════════════════╝

👤 *Target*
➤ @${targetNumber}

📊 *Gay Percentage*
➤ ${percentage}% ${emoji}

🧠 *Verdict*
${roast}${insult}

⚠️ *Disclaimer*
For entertainment purposes only 

══════════════════════
© Powered by GayCheck
`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      // Delete loading message
      if (checkingMsg?.key) {
        await client.sendMessage(m.chat, { delete: checkingMsg.key });
      }
    } catch (error) {
      console.error(error);
      await m.reply(`
╔═══════════════╗
║ 💥 SYSTEM ERROR
╚═══════════════╝
Gay meter crashed.
Try again later.
`);
    }
  },
};
