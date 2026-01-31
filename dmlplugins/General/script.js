module.exports = async (context) => {
    const { client, m, text, botname, prefix = '' } = context;

    if (text) {
        return client.sendMessage(
            m.chat,
            { text: `Hello ${m.pushName}, just use the command ${prefix}repo to check the repository.` },
            { quoted: m }
        );
    }

    try {
        const repoUrl = 'https://api.github.com/repos/MLILA17/DML-MD';
        const response = await fetch(repoUrl);
        const repoData = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch repository data');
        }

        const createdDate = new Date(repoData.created_at).toLocaleDateString('en-GB');
        const lastUpdateDate = new Date(repoData.updated_at).toLocaleDateString('en-GB');

        const replyText =
            `*${botname} Repository Information*\n\n` +
            `🌟 Stars: ${repoData.stargazers_count}\n` +
            `🔗 Forks: ${repoData.forks_count}\n` +
            `📅 Created: ${createdDate}\n` +
            `🕒 Last Updated: ${lastUpdateDate}\n` +
            `👤 Owner: ${repoData.owner.login}\n\n` +
            `Select an option below 👇`;

        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: `📦 ${botname} Repository`,
                    title: replyText,
                    footer: `Powered by ${botname}`,
                    buttons: [
                        // Row 1
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔐 View Pair Code',
                                url: 'https://session-idqr.onrender.com'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📦 View Repository',
                                url: 'https://github.com/MLILA17/DML-MD'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🌐 View Website',
                                url: 'https://portfolio.dml-tech.online'
                            })
                        },
                        // Row 2
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '👤 View GitHub Username',
                                url: 'https://github.com/MLILA17'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📢 View DML WhatsApp Channel',
                                url: 'https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📣 View Duduu Mendez Channel',
                                url: 'https://whatsapp.com/channel/0029VacgCaPKmCPGmTmrnT04'
                            })
                        }
                    ]
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Error in repo command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: `Couldn't fetch repository info.\nVisit directly:\nhttps://github.com/MLILA17/DML-MD`
            },
            { quoted: m }
        );
    }
};
