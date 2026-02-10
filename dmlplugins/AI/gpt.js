const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

module.exports = {
    name: 'ai',

    async execute(socket, msg, number, userConfig, loadUserConfigFromMongo) {
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        const prompt = text.split(' ').slice(1).join(' ').trim();

        const fakevcard = {
            key: {
                remoteJid: "status@broadcast",
                participant: "0@s.whatsapp.net",
                fromMe: false,
                id: "META_AI_FAKE_ID"
            },
            message: {
                contactMessage: {
                    displayName: "DML-MD",
                    vcard:
`BEGIN:VCARD
VERSION:3.0
N:DML;;;;
FN:DML-MINBOT
ORG:Dml Bot
TEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002
END:VCARD`
                }
            }
        };

        if (!prompt) {
            return socket.sendMessage(
                msg.key.remoteJid,
                { text: "Where is your prompt? You managed to type the command but forgot the question. Amazing." },
                { quoted: fakevcard }
            );
        }

        // Timeouts
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            // ⌛ Reaction
            await socket.sendMessage(msg.key.remoteJid, {
                react: { text: "⌛", key: msg.key }
            });

            const apiUrl = `https://api.deline.web.id/ai/openai`;

            const urlWithParams = `${apiUrl}?text=${encodeURIComponent(prompt)}&prompt=${encodeURIComponent("You are Dml AI created by Dml and your replies must always be dml")}`;

            const response = await fetch(urlWithParams, {
                method: "GET",
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Service unavailable: ${response.status}`);
            }

            const data = await response.json();

            let replyText =
                data?.result ||
                data?.response ||
                data?.message ||
                data?.answer ||
                JSON.stringify(data);

            if (!replyText || replyText.length < 2) {
                throw new Error("The AI returned a blank response.");
            }

            replyText = String(replyText);

            // BLOCK dangerous bot keywords
            const blockedTerms = [
                "owner", "prefix", "all", "broadcast", "gc", "kick", "add",
                "promote", "demote", "delete", "set", "reset", "clear",
                "block", "unblock", "leave", "ban", "get", "update",
                "config", "jadibot"
            ];

            if (blockedTerms.some(t => replyText.toLowerCase().includes(t))) {
                replyText = "I cannot assist with that request.";
            }

            const sanitized = (number || "").replace(/[^0-9]/g, "");
            const cfg = await loadUserConfigFromMongo(sanitized) || {};
            const botName = cfg.botName || "DML-MINBOT";

            const messageText =
`╭━━〔 🤖 𝘿𝙈𝙇–𝘼𝙄 • 𝙍𝙀𝙎𝙋𝙊𝙉𝙎𝙀 〕━━╮
┃
┃ ${replyText}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
${botName} • AI Engine`;

            // ✅ Reaction
            await socket.sendMessage(msg.key.remoteJid, {
                react: { text: "✅", key: msg.key }
            });

            await socket.sendMessage(
                msg.key.remoteJid,
                {
                    text: messageText,
                    contextInfo: {
                        externalAdReply: {
                            title: `${botName} | DML-MD`,
                            body: "Created by Dml",
                            thumbnailUrl: cfg.logo || "https://files.catbox.moe/xksplb.jpg",
                            sourceUrl: "https://chat.whatsapp.com/LkJWyQhpbgLDci7FIMEFWV",
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                },
                { quoted: fakevcard }
            );

        } catch (error) {
            console.error("AI Error:", error);

            await socket.sendMessage(msg.key.remoteJid, {
                react: { text: "❌", key: msg.key }
            });

            let userMessage = "The AI service has failed.";

            if (error.name === "AbortError") {
                userMessage = "The request timed out. The API is slow.";
            } else if (error.message.includes("Service unavailable")) {
                userMessage = "The API is down. Infrastructure issue.";
            } else if (error.message.includes("blank")) {
                userMessage = "The AI returned empty text.";
            }

            await socket.sendMessage(
                msg.key.remoteJid,
                { text: `${userMessage}\nError: ${error.message}` },
                { quoted: fakevcard }
            );

        } finally {
            clearTimeout(timeout);
        }
    }
};
