const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, args, text } = context;
        
        if (!text || !text.includes(',')) {
            return client.sendMessage(m.chat, {
                text: "Usage: !poll <question> , option1 , option2 , option3...\nExample: !poll Best color? , Red , Blue , Green"
            }, { quoted: m });
        }
        
        const parts = text.split(',').map(p => p.trim());
        const question = parts[0];
        const options = parts.slice(1);
        
        if (options.length < 2) {
            return client.sendMessage(m.chat, {
                text: "Please provide at least 2 options!"
            }, { quoted: m });
        }
        
        const pollMessage = `📊 *POLL: ${question}*\n\n` +
            options.map((opt, index) => `${index + 1}️⃣ ${opt}`).join('\n') +
            `\n\nReact with number emoji to vote!`;
        
        await client.sendMessage(m.chat, {
            text: pollMessage
        }, { quoted: m });
    });
};
