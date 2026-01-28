const os = require("os");

module.exports = {
    name: "ping",
    aliases: ["p", "status"],
    description: "Displays bot latency and system health",
    run: async (context) => {
        const { client, m } = context;

        try {
            const start = Date.now();

            // Subtle reaction
            await client.sendMessage(m.chat, {
                react: { text: "📡", key: m.key }
            });

            // Measure latency
            const pingMsg = await client.sendMessage(m.chat, {
                text: "Checking system status..."
            }, { quoted: m });

            const latency = Date.now() - start;

            // System stats
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
                latency < 150 ? "Excellent" :
                latency < 300 ? "Good" :
                latency < 600 ? "Fair" : "Poor";

            await client.sendMessage(
                m.chat,
                {
                    text:
`╭───〔 🤖 BOT STATUS 〕───╮
│
│  📶 Latency      : ${latency} ms
│  ⏱️ Uptime       : ${formatUptime(uptime)}
│
│  🧠 Memory Usage :
│   ├ Used         : ${usedMem} MB
│   ├ Free         : ${freeMem} MB
│   └ Total        : ${totalMem} MB
│
│  🖥 Platform     : ${platform}
│  🩺 Health       : ${health}
│  🌐 Network      : Online
│
╰────〔 DML-MD 〕──────╯`
                },
                { quoted: pingMsg }
            );

        } catch (err) {
            console.error("Ping command error:", err);
            await m.reply("⚠️ Unable to fetch system status.");
        }
    }
};
