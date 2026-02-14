const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "ping",
    aliases: ["p", "status", "speed"],
    description: "Displays bot latency and system health",
    run: async (context) => {
        const { client, m } = context;

        try {
            const start = Date.now();

            /* ===== RANDOM IMAGE FROM /Dmlimages ===== */
            const dmlFolder = path.join(__dirname, "../Dmlimages");
            let imageBuffer = null;

            if (fs.existsSync(dmlFolder)) {
                const images = fs.readdirSync(dmlFolder)
                    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

                if (images.length > 0) {
                    const randomImage = images[Math.floor(Math.random() * images.length)];
                    imageBuffer = fs.readFileSync(path.join(dmlFolder, randomImage));
                }
            }

            /* ===== RANDOM REACTION ===== */
            const reactionEmojis = ['🔥','⚡','🚀','💨','🎯','🎉','🌟','💥','🕐','🔹'];
            const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

            await client.sendMessage(m.chat, {
                react: { text: reactionEmoji, key: m.key }
            });

            const latency = Date.now() - start;

            /* ===== SYSTEM INFO ===== */
            const uptime = process.uptime();
            const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
            const platform = os.platform();

            const formatUptime = (s) => {
                const d = Math.floor(s / 86400);
                const h = Math.floor((s % 86400) / 3600);
                const m = Math.floor((s % 3600) / 60);
                return `${d}d ${h}h ${m}m`;
            };

            const health =
                latency < 150 ? "Excellent 🟢" :
                latency < 300 ? "Good 🟢" :
                latency < 600 ? "Fair 🟡" : "Poor 🔴";

            const text =
`╔════❰ 🤖 DML-MD STATUS ❱════╗
║
║ 📶 *Latency:* ${latency} ms
║ ⏱️ *Uptime:* ${formatUptime(uptime)}
║
║ 🧠 *Memory*
║   ├ Used  : ${usedMem} MB
║   ├ Free  : ${freeMem} MB
║   └ Total : ${totalMem} MB
║
║ 🖥 *Platform:* ${platform}
║ 🩺 *Health:* ${health}
║ 🌐 *Network:* Online
║
╚════════════════════════════╝`;

            /* ===== SEND WITH IMAGE + NEWSLETTER STYLE ===== */
            if (imageBuffer) {
                await client.sendMessage(m.chat, {
                    image: imageBuffer,
                    caption: text,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363403958418756@newsletter',
                            newsletterName: "DML-STATUS",
                            serverMessageId: 300
                        }
                    }
                }, { quoted: m });
            } else {
                await client.sendMessage(m.chat, {
                    text,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363403958418756@newsletter',
                            newsletterName: "DML-STATUS",
                            serverMessageId: 300
                        }
                    }
                }, { quoted: m });
            }

        } catch (err) {
            console.error("Ping command error:", err);
            await m.reply("⚠️ Unable to fetch system status.");
        }
    }
};
