const axios = require("axios");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

module.exports = async (context) => {
    const { client, m } = context;

    const formatStylishReply = (message) => {
        return (
            `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `┋❒ ${message}\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `> ©POWERED BY YOU`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            "⚠️ Seriously? You forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME*.\n" +
                            "Fix your setup before crying for updates. "
                        ),
                    },
                    { quoted: m }
                );
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "🔄 Fine… triggering update.\n" +
                        "Don’t complain if the bot restarts in your face. 🤦🏻"
                    ),
                },
                { quoted: m }
            );

            await axios.post(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    source_blob: {
                        url: "https://github.com/MLILA17/DML-MD/tarball/main",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                        "Content-Type": "application/json",
                    },
                }
            );

            return await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "🚀 Update triggered.\n" +
                        "Sit tight while DML-MD resurrects with fresh upgrades. 💀"
                    ),
                },
                { quoted: m }
            );

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg =
                    "❌ Your Heroku API key is trash.\n" +
                    "Fix *HEROKU_API_KEY* before crying here.";
            } else if (errorMessage.includes("not found")) {
                msg =
                    "❌ Heroku app not found.\n" +
                    "Are you sure *HEROKU_APP_NAME* is correct, genius?";
            } else {
                msg = `❌ Update failed:\n${errorMessage}\nTry again without panicking.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: m }
            );
        }
    });
};
//DML