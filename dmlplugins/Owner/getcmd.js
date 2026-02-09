const fs = require('fs').promises;

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    try {
        // Restrict access to the bot owner only
        const allowedNumber = '255622220680@s.whatsapp.net';
        if (m.sender !== allowedNumber) {
            return await client.sendMessage(m.chat, {
                text: `❌ *Access denied!*\nThis command is restricted to the bot owner only.\n> Powered by DML-TECH`
            }, { quoted: m });
        }

        if (!text) {
            return await client.sendMessage(m.chat, {
                text: `📄 *Please provide a command name!*\nExample: *${prefix}getcmd ping*\n> Powered by DML-TECH`
            }, { quoted: m });
        }

        const categories = [
            { name: 'General' },
            { name: 'Settings' },
            { name: 'Owner' },
            { name: 'Heroku' },
            { name: 'Wa-Privacy' },
            { name: 'Groups' },
            { name: 'AI' },
            { name: '+18' },
            { name: 'Logo' },
            { name: 'Search' },
            { name: 'Coding' },
            { name: 'Media' },
            { name: 'Editing' },
            { name: 'Utils' }
        ];

        let fileFound = false;
        const commandName = text.endsWith('.js') ? text.slice(0, -3) : text;

        for (const category of categories) {
            const filePath = `./dmlplugins/${category.name}/${commandName}.js`;

            try {
                const data = await fs.readFile(filePath, 'utf8');

                const previewText = 
`╭─〔 ✅ COMMAND LOCATED 〕╮
│
│ 📂 Category : ${category.name}
│ 📄 File     : ${commandName}.js
│
╰────────────────────╯

📜 *Source Code Preview*
\`\`\`javascript
${data.slice(0, 3500)}
\`\`\`

📋 Click *COPY SOURCE* to get full code
⚡ _Powered by **DML-TECH**_`;

                await client.sendMessage(m.chat, {
                    text: previewText,
                    buttons: [
                        {
                            buttonId: `${prefix}copycmd ${commandName}`,
                            buttonText: { displayText: 'COPY SOURCE' },
                            type: 1
                        }
                    ],
                    headerType: 1
                }, { quoted: m });

                fileFound = true;
                break;
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    return await client.sendMessage(m.chat, {
                        text: `⚠️ *Error reading command file:* ${err.message}\n> Powered by DML-TECH`
                    }, { quoted: m });
                }
            }
        }

        if (!fileFound) {
            await client.sendMessage(m.chat, {
                text: `❌ *Command not found:* ${commandName}\nPlease try a valid command name.\n> Powered by DML-TECH`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error in getcmd:', error);
        await client.sendMessage(m.chat, {
            text: `⚠️ *Failed to process request:* ${error.message}\nPowered by *DML-MD v3*`
        }, { quoted: m });
    }
};
