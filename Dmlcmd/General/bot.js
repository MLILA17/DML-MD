const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getSettings } = require('../../Database/config');

module.exports = {
    name: 'start',
    aliases: ['alive', 'online', 'Dml'],
    description: 'Check if bot is alive',
    run: async (context) => {
        const { client, m, mode, pict, botname, text, prefix } = context;

        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        const xhClintonPaths = [
            path.join(__dirname, 'Daudi_Musa'),
            path.join(process.cwd(), 'Daudi_Musa'),
            path.join(__dirname, '..', 'Daudi_Musa')
        ];

        let audioFolder = null;
        for (const folderPath of xhClintonPaths) {
            if (fs.existsSync(folderPath)) {
                audioFolder = folderPath;
                break;
            }
        }

        if (audioFolder) {
            const possibleFiles = [];
            for (let i = 1; i <= 10; i++) {
                const fileName = `menu${i}`;
                const audioExtensions = ['.mp3', '.m4a', '.ogg', '.opus', '.wav'];
                
                for (const ext of audioExtensions) {
                    const fullPath = path.join(audioFolder, fileName + ext);
                    if (fs.existsSync(fullPath)) {
                        possibleFiles.push(fullPath);
                    }
                }
            }

            if (possibleFiles.length > 0) {
                const randomFile = possibleFiles[Math.floor(Math.random() * possibleFiles.length)];
                await client.sendMessage(
                    m.chat,
                    {
                        audio: { url: randomFile },
                        ptt: true,
                        mimetype: 'audio/mpeg',
                        fileName: 'fee-start.mp3',
                    },
                    { quoted: m }
                );
            }
        }

        const settings = await getSettings();  
        const effectivePrefix = settings.prefix || '.';

        const msg = generateWAMessageFromContent(  
            m.chat,  
            {  
                interactiveMessage: {  
                    body: { 
                        text: `◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Yo @${m.pushName}! You actually bothered to check if I'm alive? 🙄\n│❒ ${botname} is active 24/7, unlike your brain cells. 🧠⚡\n│❒ Stop wasting my time and pick something useful below.\n◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈` 
                    },  
                    footer: { text: `> ©POWERED BY YOU ${botname}` },  
                    nativeFlowMessage: {  
                        buttons: [  
                            {  
                                name: 'single_select',  
                                buttonParamsJson: JSON.stringify({  
                                    title: '𝐖𝐇𝐀𝐓 𝐃𝐎 𝐘𝐎𝐔 𝐖𝐀𝐍𝐓?',  
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