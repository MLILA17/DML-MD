module.exports = async (context) => {
    const { client, m, text, botname, fetchJson, prefix } = context;
    const num = m.sender; 

    if (!text) return m.reply(`Provide a prompt and a programming language. Usage: ${prefix}aicode <language> <prompt>`);

    const [language, ...promptArr] = text.split(' ');
    const prompt = promptArr.join(' ');

    if (!language || !prompt) {
        return m.reply(`Please provide both a language and a prompt. Example: *${prefix}aicode python 'Create a Hello World program*`);
    }

    try {
        
        const response = await fetchJson(`https://api.dreaded.site/api/aicode?prompt=${encodeURIComponent(prompt)}&language=${language.toLowerCase()}`);

        if (response.success) {
            const { code, language } = response.result;
            m.reply(`Here is your code in ${language}:\n\n${code}`);
        } else {
            m.reply("There was an issue generating the code. Please check your prompt and language.");
        }
    } catch (error) {
        console.error(error);
        m.reply("Something went wrong while fetching the code.");
    }
};