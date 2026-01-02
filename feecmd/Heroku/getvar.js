const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

const axios = require("axios");
const { herokuAppName, herokuApiKey } = require("../../Env/settings");


module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, Owner, prefix } = context;

        if (!herokuAppName || !herokuApiKey) {
            await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
            return;
        }

        if (!text) {
            await m.reply(`Please enter the var name to get in the format: \`${prefix}getvar VAR_NAME\`\n\nExample: \`${prefix}getvar MYCODE\``);
            return;
        }

        const varName = text.split(" ")[0].trim();

        async function getHerokuConfigVar(varName) {
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
                const varValue = configVars[varName];

                if (varValue) {
                    if (m.isGroup) {
                        await m.reply("It is recommended to use this command in inbox to prevent exposing sensitive info like session and APIs.");
                    }
                    await m.reply(`Config var \`${varName}\` is set to ${varValue}.`);
                } else {
                    await m.reply(`Config var \`${varName}\` does not exist.`);
                }
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                await m.reply(`Failed to retrieve the config var. ${errorMessage}`);
                console.error("Error fetching config var:", errorMessage);
            }
        }

        if (m.isGroup) {
            await getHerokuConfigVar(varName);
        } else {
            await getHerokuConfigVar(varName);
        }
    });
};