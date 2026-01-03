module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    try {
        let pl, laliga, bundesliga, serieA, ligue1;

        const plData = await fetchJson('https://api.dreaded.site/api/matches/PL');
        pl = plData.data;

        const laligaData = await fetchJson('https://api.dreaded.site/api/matches/PD');
        laliga = laligaData.data;

        const bundesligaData = await fetchJson('https://api.dreaded.site/api/matches/BL1');
        bundesliga = bundesligaData.data;

        const serieAData = await fetchJson('https://api.dreaded.site/api/matches/SA');
        serieA = serieAData.data;

        const ligue1Data = await fetchJson('https://api.dreaded.site/api/matches/FR');
        ligue1 = ligue1Data.data;

        let message = `Today Football Matches ⚽\n\n`;

        message += typeof pl === 'string' ? `🇬🇧 Premier League:\n${pl}\n\n` : pl.length > 0 ? `🇬🇧 Premier League:\n${pl.map(match => {
            const { game, date, time } = match;
            return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
        }).join('\n')}\n\n` : "🇬🇧 Premier League: No matches scheduled\n\n";

        if (typeof laliga === 'string') {
            message += `🇪🇸 La Liga:\n${laliga}\n\n`;
        } else {
            message += laliga.length > 0 ? `🇪🇸 La Liga:\n${laliga.map(match => {
                const { game, date, time } = match;
                return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
            }).join('\n')}\n\n` : "🇪🇸 La Liga: No matches scheduled\n\n";
        }

        message += typeof bundesliga === 'string' ? `🇩🇪 Bundesliga:\n${bundesliga}\n\n` : bundesliga.length > 0 ? `🇩🇪 Bundesliga:\n${bundesliga.map(match => {
            const { game, date, time } = match;
            return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
        }).join('\n')}\n\n` : "🇩🇪 Bundesliga: No matches scheduled\n\n";

        message += typeof serieA === 'string' ? `🇮🇹 Serie A:\n${serieA}\n\n` : serieA.length > 0 ? `🇮🇹 Serie A:\n${serieA.map(match => {
            const { game, date, time } = match;
            return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
        }).join('\n')}\n\n` : "🇮🇹 Serie A: No matches scheduled\n\n";

        message += typeof ligue1 === 'string' ? `🇫🇷 Ligue 1:\n${ligue1}\n\n` : ligue1.length > 0 ? `🇫🇷 Ligue 1:\n${ligue1.map(match => {
            const { game, date, time } = match;
            return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
        }).join('\n')}\n\n` : "🇫🇷 Ligue 1: No matches scheduled\n\n";

        message += "Times and dates are in East African Timezone (EAT).";

        await m.reply(message);
    } catch (error) {
        m.reply('Something went wrong. Unable to fetch matches.' + error);
    }
};