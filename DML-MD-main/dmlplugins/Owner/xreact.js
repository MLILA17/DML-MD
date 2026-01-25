const axios = require('axios');

module.exports = {
    name: 'rch',
    aliases: ['reactchannel', 'channelreact'],
    description: 'Send reactions to WhatsApp channel posts (Developer Only)',
    run: async (context) => {
        const { client, m, text } = context;

        const developerNumber = "255622220680@s.whatsapp.net";

        // 🔒 Developer check
        if (m.sender !== developerNumber) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`🚫 *Access Denied*

This command is restricted to the developer only.
You are not authorized to use it.

© Powered by YOU`
                },
                { quoted: m }
            );
        }

        // 📌 Format check
        if (!text || !text.trim()) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`⚠️ *Invalid Usage*

Correct format:
.rch <channel-link> <emoji1,emoji2,emoji3>

Example:
.rch https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H 😂,❤️,😍

© Powered by YOU`
                },
                { quoted: m }
            );
        }

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const args = text.trim().split(' ');
            const channelLink = args[0];
            const emojisString = args.slice(1).join(' ');

            const emojis = emojisString
                .split(',')
                .map(e => e.trim())
                .filter(e => e.length > 0);

            // 😶 Emoji check
            if (emojis.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`❌ *No Emojis Detected*

Provide emojis in this format:
emoji1,emoji2,emoji3

Example:
😂,❤️,😍

© Powered by YOU`
                    },
                    { quoted: m }
                );
            }

            // 🔗 Channel link validation
            const urlMatch = channelLink.match(/whatsapp\.com\/channel\/([a-zA-Z0-9@\.\-]+)\/(\d+)$/);
            if (!urlMatch) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`❌ *Invalid Channel Link*

The link must include a valid post ID at the end.

Example:
https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H/123

© Powered by YOU`
                    },
                    { quoted: m }
                );
            }

            const bearerToken =
                "6dfd5b7299ec488611717b2478b7aaca241c0f65bb97314873f978be58835a00";

            const response = await axios.post(
                'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post',
                {
                    post_link: channelLink,
                    reacts: emojis
                },
                {
                    headers: {
                        authorization: `Bearer ${bearerToken}`,
                        'content-type': 'application/json',
                        accept: 'application/json',
                        'user-agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 30000
                }
            );

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            // ✅ Success message
            await client.sendMessage(
                m.chat,
                {
                    text:
`✅ *Reactions Sent Successfully*

📢 Channel:
${channelLink}

😀 Emojis:
${emojis.join(', ')}

📊 API Status:
${response.status}

🔥 Developer Privilege:
Unlimited reactions enabled

© Powered by DML-MD`
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Channel reaction error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = "Failed to send reactions.";

            if (error.response?.status === 401) {
                errorMessage += " Invalid or expired token.";
            } else if (error.response?.status === 404) {
                errorMessage += " Channel or post not found.";
            } else if (error.message.includes('timeout')) {
                errorMessage += " Request timed out.";
            } else if (error.message.includes('Network Error')) {
                errorMessage += " Network connection issue.";
            } else {
                errorMessage += ` ${error.message}`;
            }

            await client.sendMessage(
                m.chat,
                {
                    text:
`❌ *Operation Failed*

${errorMessage}

© Powered by DML-MD`
                },
                { quoted: m }
            );
        }
    },
};
