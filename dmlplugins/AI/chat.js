const { saveConversation, getRecentMessages } = require('../../Database/config');
const { deleteUserHistory } = require('../../Database/config'); 

module.exports = async (context) => {
    const { client, m, text, botname, fetchJson, prefix } = context;
    const num = m.sender;

    if (!text) return m.reply(`Provide some text or query for AI chat. Your chats with the AI are stored indefinitely to create context, to delete your chat history send *${prefix}chat --reset*`);

    
    if (text.toLowerCase().includes('--reset')) {
        await deleteUserHistory(num);
        return m.reply("Conversation history cleared.");
    }

    try {
        await saveConversation(num, 'user', text);

        const recentHistory = await getRecentMessages(num);
        const contextString = recentHistory.map(entry => `${entry.role}: ${entry.message}`).join('\n');

        const queryWithContext = encodeURIComponent(`${contextString}\nuser: ${text.replace('--reset', '').trim()}`);
        const data = await fetchJson(`https://api.dreaded.site/api/aichat?query=${queryWithContext}`);

        const response = data?.result || "I'm not sure how to respond to that.";

        await saveConversation(num, 'bot', response);
        await m.reply(response);

    } catch (error) {
        console.error(error);
        m.reply("Something went wrong...\n\n" + error.message);
    }
};