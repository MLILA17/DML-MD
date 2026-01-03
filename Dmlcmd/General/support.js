module.exports = async (context) => {
  const { client, m } = context;

  const message = `
╭┈━〔 *🄵🄴🄴-🅇🄼🄳 Support Links* 〕━┈┈╮

> 👑 *Owner*  
https://wa.me/255752593977

> 📢 *Channel Link*  
https://whatsapp.com/channel/0029Vb6mzVF7tkj42VNPrZ3V

> 👥 *Group*  
https://chat.whatsapp.com/FA1GPSjfUQLCyFbquWnRIS

╰━┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈━╯
>©POWERED BY YOU
`;

  try {
    await client.sendMessage(
      m.chat,
      { text: message },
      { quoted: m }
    );
  } catch (error) {
    console.error("Support command error:", error);
    await m.reply("⚠️ Failed to send support links. Please try again.");
  }
};
