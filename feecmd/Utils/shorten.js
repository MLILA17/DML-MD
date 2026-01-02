const axios = require('axios');

module.exports = {
    name: 'shorten',
    aliases: ['shortlink', 'tinyurl', 'short'],
    description: 'Shorten URLs with TinyURL',
    run: async (context) => {
        const { client, m, text } = context;

        const formatStylishReply = (message) => {
            return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳`;
        };

        if (!text) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply("You forgot the URL, genius. 🤦🏻\nExample: .shorten https://github.com/Fred1e/Fee-Xmd")
            }, { quoted: m });
        }

        let url = text.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const encodedUrl = encodeURIComponent(url);
            const apiUrl = `https://api.nekolabs.web.id/tools/shortlink/tinyurl?url=${encodedUrl}`;

            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (!response.data?.success || !response.data?.result) {
                throw new Error('API returned invalid response');
            }

            const shortUrl = response.data.result;
            const responseTime = response.data.responseTime || 'N/A';

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(m.chat, {
                interactiveMessage: {
                    header: `✅ URL SHORTENED SUCCESSFULLY`,
                    title: `Original URL:\n${url}\n\nShortened URL:\n${shortUrl}\n\nResponse Time: ${responseTime}`,
                    footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄵🄴🄴-🅇🄼🄳",
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📋 Copy Short URL",
                                id: "copy_shorturl",
                                copy_code: shortUrl
                            })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🌐 Open in Browser",
                                id: "open_url",
                                copy_code: shortUrl
                            })
                        }
                    ]
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Shorten error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = "Failed to shorten URL, your link is probably trash. ";
            
            if (error.response?.status === 400) {
                errorMessage += "Invalid URL format. 🔗";
            } else if (error.response?.status === 429) {
                errorMessage += "Rate limit exceeded. Try again later. ⏳";
            } else if (error.message.includes('timeout')) {
                errorMessage += "API timeout, your link is too heavy. ⏱️";
            } else if (error.message.includes('ENOTFOUND')) {
                errorMessage += "Can't reach API server. 🌐";
            } else if (error.message.includes('Invalid response')) {
                errorMessage += "API returned garbage. 🗑️";
            } else {
                errorMessage += `Error: ${error.message}`;
            }

            await client.sendMessage(m.chat, {
                text: formatStylishReply(errorMessage)
            }, { quoted: m });
        }
    },
};