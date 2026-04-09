module.exports = async (context) => {
    const { client, m, text, botname, prefix = '' } = context;

    // If user types extra text
    if (text) {
        return client.sendMessage(
            m.chat,
            {
                text: `Hello ${m.pushName}, type *${prefix}support* to view all official support links.`
            },
            { quoted: m }
        );
    }

    try {
        const replyText =
            `╭─❖${botname} OFFICIAL LINKS❖─╮\n` +
            `│\n` +
            `│  Stay connected with our official platforms\n` +
            `│  to receive:\n` +
            `│\n` +
            `│  • Updates & Announcements\n` +
            `│  • Bot Features & Fixes\n` +
            `│  • Tech Tutorials & Support\n` +
            `│\n` +
            `╰─➤ Select an option below 👇`;

        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: `📢 ${botname} Support`,
                    title: replyText,
                    footer: `Powered by ${botname}`,
                    buttons: [
                        // 1. Duduu Mendez WhatsApp Channel
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📣 Follow Duduu Mendez WA Channel',
                                url: 'https://whatsapp.com/channel/0029VacgCaPKmCPGmTmrnT04'
                            })
                        },

                        // 2. DML WhatsApp Channel
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📢 Follow DML WhatsApp Channel',
                                url: 'https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H'
                            })
                        },

                        // 3. Duduu Mendez YouTube
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '▶️ Duduu Mendez YouTube Channel',
                                url: 'https://youtube.com/@duduu_mendez?si=k7TYO2vaQQVQ1x6Q'
                            })
                        },

                        // 4. DML YouTube
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '▶️ DML YouTube Channel',
                                url: 'https://www.youtube.com/@DaudyMussa-h1r'
                            })
                        },

                        // 5. Telegram Channel
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📡 Follow Telegram Channel',
                                url: 'https://t.me/Dml_staff'
                            })
                        },

                        // 6. Telegram Group
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '👥 Join Telegram Group',
                                url: 'https://t.me/+7jPo9lc3PfYwYWE0'
                            })
                        },

                        // 7. GitHub
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '💻 Follow DML on GitHub',
                                url: 'https://github.com/MLILA17'
                            })
                        }
                    ]
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Error in support command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: `❌ Unable to load support links right now.\nPlease try again later.`
            },
            { quoted: m }
        );
    }
};
