const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) {
        return m.reply("Example usage:\n.codegen Function to calculate triangle area|Python");
    }

    let [prompt, language] = text.split("|").map(v => v.trim());

    if (!prompt || !language) {
        return m.reply(
            "Invalid format!\nUse the format:\n.codegen <prompt>|<language>\n\n" +
            "Example:\n.codegen Check for prime number|JavaScript"
        );
    }

    try {
        const payload = {
            customInstructions: prompt,
            outputLang: language
        };

        const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

        if (!data || typeof data !== "string") {
            return m.reply("Failed to retrieve code from API.");
        }

        m.reply(
            `*Generated Code (${language}):*\n` +
            "```" + language.toLowerCase() + "\n" +
            data.trim() +
            "\n```"
        );

    } catch (error) {
        console.error(error);
        m.reply("An error occurred while processing your request.");
    }
};