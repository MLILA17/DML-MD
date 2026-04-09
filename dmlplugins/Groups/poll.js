const polls = new Map();

const FOOTER = '> © Powered by DML-MD';

module.exports = {
    name: 'poll',
    alias: ['createpoll', 'vote'],
    description: 'Create a group poll',
    run: async (context) => {
        const { client, m } = context;

        if (!m.isGroup) {
            return m.reply(
                `╭━━〔 *DML-MD • POLL SYSTEM* 〕━━⬣
┃
┃ ❌ This command works in groups only.
┃ 📌 Please use it inside a group chat.
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
            );
        }

        const input = (context.text || context.q || '').trim();

        if (!input.includes(',')) {
            return m.reply(
                `╭━━〔 *DML-MD • POLL FORMAT* 〕━━⬣
┃
┃ 📝 Format:
┃ .poll Question, Option1, Option2, ...
┃
┃ ✅ Example:
┃ .poll Who is the best artist in Tanzania?, Diamond Platnumz, Ali kiba, Other bots
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
            );
        }

        const parts = input.split(',').map(s => s.trim()).filter(Boolean);

        if (parts.length < 3) {
            return m.reply(
                `╭━━〔 *DML-MD • POLL ERROR* 〕━━⬣
┃
┃ ⚠️ You need:
┃ • 1 question
┃ • At least 2 options
┃
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
            );
        }

        const question = parts[0];
        const options = parts.slice(1).slice(0, 12);

        try {
            await client.sendMessage(m.chat, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            });
        } catch {
            const nums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '⓫', '⓬'];
            const optText = options.map((o, i) => `┃ ${nums[i] || '•'} ${o}`).join('\n');

            await client.sendMessage(
                m.chat,
                {
                    text: `╭━━〔 *DML-MD • GROUP POLL* 〕━━⬣
┃
┃ ❓ *Question:*
┃ ${question}
┃
${optText}
┃
┃ 🗳️ Reply with your choice above.
╰━━━━━━━━━━━━━━━━━━⬣
${FOOTER}`
                },
                { quoted: m }
            );
        }
    }
};
