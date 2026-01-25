module.exports = async (context) => {
  const { client, m, text, botname } = context;

  if (text) {
    return client.sendMessage(
      m.chat,
      {
        text: `🛑 *Notice*\n\nHi ${m.pushName}, this command does not need extra text.\nUse: *!uptime*`
      },
      { quoted: m }
    );
  }

  try {
    const formatUptime = (seconds) => {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const uptimeText = formatUptime(process.uptime());

    const replyText =
`📊 *${botname} — System Uptime*

────────────────────
🕑 Uptime       : *${uptimeText}*
🟢 Status      : Online
🔹 Stability   : Normal
────────────────────
📌 Last checked: ${new Date().toLocaleString()}

🤖 Powered by *${botname}*`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m }
    );

  } catch (error) {
    console.error('Uptime error:', error);
    await client.sendMessage(
      m.chat,
      {
        text: `⚠️ *Error*\nCould not retrieve uptime info at this time. Please try again later.`
      },
      { quoted: m }
    );
  }
};
