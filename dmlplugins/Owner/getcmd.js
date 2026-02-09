const fs = require('fs').promises;

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    try {
        // OWNER ONLY
        const allowedNumber = '255622220680@s.whatsapp.net';
        if (m.sender !== allowedNumber) {
            return client.sendMessage(
                m.chat,
                { text: '❌ Access denied!\nOwner only command.\n> Powered by DML-TECH' },
                { quoted: m }
            );
        }

        if (!text) {
            return client.sendMessage(
                m.chat,
                { text: `📄 Usage:\n${prefix}getcmd play\n> Powered by DML-TECH` },
                { quoted: m }
            );
        }

        const categories = [
            'General','Settings','Owner','Heroku','Wa-Privacy','Groups',
            'AI','+18','Logo','Search','Coding','Media','Editing','Utils'
        ];

        const commandName = text.endsWith('.js') ? text.slice(0, -3) : text;
        let found = false;

        for (const category of categories) {
            const filePath = `./dmlplugins/${category}/${commandName}.js`;

            try {
                const sourceCode = await fs.readFile(filePath, 'utf8');

                const preview = sourceCode.length > 3500
                    ? sourceCode.slice(0, 3500) + '\n\n// ... truncated'
                    : sourceCode;

                await client.sendMessage(
                    m.chat,
                    {
                        interactiveMessage: {
                            header: '📦 DML-MD COMMAND SOURCE',
                            title:
`╭─〔 ✅ COMMAND LOCATED 〕╮
│
│ 📂 Category : ${category}
│ 📄 File     : ${commandName}.js
│
╰────────────────────╯

📜 *Source Code Preview*
\`\`\`js
${preview}
\`\`\`

Tap below to copy full source code`,
                            footer: '> © Powered by DML-TECH',
                            buttons: [
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: ' Copy Source',
                                        id: 'copy_cmd_source',
                                        copy_code: sourceCode
                                    })
                                }
                            ]
                        }
                    },
                    { quoted: m }
                );

                found = true;
                break;

            } catch (err) {
                if (err.code !== 'ENOENT') {
                    return client.sendMessage(
                        m.chat,
                        { text: `⚠️ Error reading file:\n${err.message}` },
                        { quoted: m }
                    );
                }
            }
        }

        if (!found) {
            await client.sendMessage(
                m.chat,
                { text: `❌ Command not found: *${commandName}*` },
                { quoted: m }
            );
        }

    } catch (error) {
        console.error('GETCMD ERROR:', error);
        await client.sendMessage(
            m.chat,
            { text: `⚠️ Failed:\n${error.message}` },
            { quoted: m }
        );
    }
};
