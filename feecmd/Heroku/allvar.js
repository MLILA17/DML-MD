const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

const axios = require("axios");
const { herokuAppName, herokuApiKey } = require("../../Env/settings");

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, Owner } = context;

        if (!herokuAppName || !herokuApiKey) {
            await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
            return;
        }

        async function getHerokuConfigVars() {
            try {
                const response = await axios.get(
                    `https://api.heroku.com/apps/${herokuAppName}/config-vars`,
                    {
                        headers: {
                            Authorization: `Bearer ${herokuApiKey}`,
                            Accept: "application/vnd.heroku+json; version=3",
                        },
                    }
                );

                const configVars = response.data;
                let configMessage = "";

                if (configVars && Object.keys(configVars).length > 0) {
                    configMessage = "⚙️ Current Heroku Config Vars\n\n";
                    for (const [key, value] of Object.entries(configVars)) {
                        configMessage += `${key}: ${value}\n\n`;  
                    }

                    if (m.isGroup) {
                        await client.sendMessage(m.sender, { text: configMessage }, { quoted: m });
                        await m.reply("For security reasons, the vars have been sent to your inbox.");
                    } else {
                        await m.reply(configMessage);
                    }
                } else {
                    await m.reply("No config vars found for your Heroku app.");
                }
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                await m.reply(`Failed to retrieve config vars. ${errorMessage}`);
                console.error("Error fetching Heroku config vars:", errorMessage);
            }
        }

        await getHerokuConfigVars();
    });
};