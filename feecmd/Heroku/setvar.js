const axios = require("axios");
const { herokuAppName, herokuApiKey } = require("../../Env/settings");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, Owner, prefix } = context;

        if (!herokuAppName || !herokuApiKey) {
            await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
            return;
        }

        if (!text) {
            await m.reply(`Please enter the var to modify and its new value in this format: \`${prefix}setvar VAR_NAME=VALUE\`\nExample: \`${prefix}setvar MYCODE=254\``);
            return;
        }

        async function setHerokuConfigVar(varName, value) {
            try {
                const response = await axios.patch(
                    `https://api.heroku.com/apps/${herokuAppName}/config-vars`,
                    {
                        [varName]: value
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${herokuApiKey}`,
                            Accept: "application/vnd.heroku+json; version=3",
                        },
                    }
                );

                if (response.status === 200) {
                    await m.reply(`Config var \`${varName}\` has been successfully updated to \`${value}\`. Wait 2min for change to effect as bot restarts.`);
                } else {
                    await m.reply("Failed to update the config var. Please try again.");
                }
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                await m.reply(`Failed to set the config var. ${errorMessage}`);
                console.error("Error updating config var:", errorMessage);
            }
        }

        const parts = text.split("=");
        if (parts.length !== 2) {
            await m.reply(`Invalid format. Please make sure to enter the var name and value in this format: \`${prefix}setvar VAR_NAME=VALUE\`\nExample: \`${prefix}setvar MYCODE=255\``);
            return;
        }

        const varName = parts[0].trim();
        const value = parts[1].trim();

        await setHerokuConfigVar(varName, value);
    });
};