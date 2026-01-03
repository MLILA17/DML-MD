module.exports = async (context) => {
    const { client, m, text, botname, fetchJson } = context;

    if (!text) {
        return m.reply("Provide some text or query. This AI will search and summarize results from Google.");
    }

    try {
        const data = await fetchJson(`https://api.dreaded.site/api/aisearch?query=${text}`);

        if (data && data.result) {
            const res = data.result;
            await m.reply(res);
        } else {
            m.reply("Invalid response from the API.");
        }
    } catch (error) {
        m.reply("An error occurred while connecting to the API. Please try again.\n" + error);
    }
};