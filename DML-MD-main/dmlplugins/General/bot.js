const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getSettings } = require('../../Database/config');

module.exports = {
    name: 'start',
    aliases: ['alive', 'online', 'dml'],
    description: 'Check if bot is alive',
    run: async (context) => {
        const { client, m, botname } = context;

        // React to message
        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        const settings = await getSettings();  
        const effectivePrefix = settings.prefix || '.';

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: {
                        text: `✨ *Hello @${m.pushName}!*\n\n` +
                              `💡 *${botname} is online and ready to assist you!* \n` +
                              `📌 Explore the options below to get started.\n\n` +
                              `⚡ Enjoy fast responses and interactive features!`
                    },
                    footer: { text: `> POWERED BY ${botname}` },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '📋 Select an Option',
                                    sections: [
                                        {
                                            rows: [
                                                { title: '📱 Menu', description: 'Get all commands', id: `${effectivePrefix}menu` },
                                                { title: '⚙ Settings', description: 'Bot settings', id: `${effectivePrefix}settings` },
                                                { title: '🏓 Ping', description: 'Check bot speed', id: `${effectivePrefix}ping` },
                                                { title: '🔄 Update', description: 'Check for updates', id: `${effectivePrefix}update` },
                                            ],
                                        },
                                    ],
                                }),
                            },
                        ],
                    },
                },
            },
            { quoted: m }
        );

        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    },
};
