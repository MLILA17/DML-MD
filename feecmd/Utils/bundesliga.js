module.exports = async (context) => {

    const { client, m, text, fetchJson } = context;

    try {

        const data = await fetchJson('https://api.dreaded.site/api/standings/BL1');

        const standings = data.data;

        const message = `BUNDESLIGA TABLE STANDINGS\n\n${standings}`;

        await m.reply(message);

    } catch (error) {
        m.reply('Something went wrong. Unable to fetch EPL standings.');
    }

}