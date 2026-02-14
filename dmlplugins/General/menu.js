const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getSettings } = require('../../Database/config');

module.exports = {
    name: 'menu',
    aliases: ['help', 'commands', 'list'],
    description: 'Displays the DML-MD command menu with interactive buttons',
    run: async (context) => {
        const { client, m, mode, pict, botname, text, prefix } = context;

        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        if (text) {  
            await client.sendMessage(  
                m.chat,  
                {  
                    text: `╭──❖─ DML-MD ─❖──╮\n│❒ Hi ${m.pushName}, just type *${prefix}menu* to see options.\n╰───────────────────╯`,  
                },  
                { quoted: m, ad: true }  
            );  
            return;  
        }  

        const settings = await getSettings();  
        const effectivePrefix = settings.prefix || '.';  

        const toFancyFont = (text, isUpperCase = false) => {  
            const fonts = {  
                A: '𝘼', B: '𝘽', C: '𝘾', D: '𝘿', E: '𝙀', F: '𝙁', G: '𝙂', H: '𝙃', I: '𝙄', J: '𝙅', K: '𝙆', L: '𝙇', M: '𝙈',  
                N: '𝙉', O: '𝙊', P: '𝙋', Q: '𝙌', R: '𝙍', S: '𝙎', T: '𝙏', U: '𝙐', V: '𝙑', W: '𝙒', X: '𝙓', Y: '𝙔', Z: '𝙕',  
                a: '𝙖', b: '𝙗', c: '𝙘', d: '𝙙', e: '𝙚', f: '𝙛', g: '𝙜', h: '𝙝', i: '𝙞', j: '𝙟', k: '𝙠', l: '𝙡', m: '𝙢',  
                n: '𝙣', o: '𝙤', p: '𝙥', q: '𝙦', r: '𝙧', s: '𝙨', t: '𝙩', u: '𝙪', v: '𝙫', w: '𝙬', x: '𝙭', y: '𝙮', z: '𝙯',  
            };  
            return (isUpperCase ? text.toUpperCase() : text.toLowerCase())  
                .split('')  
                .map((char) => fonts[char] || char)  
                .join('');  
        };  

        // Professional menu text
        const menuText = `
╔══════════════════════╗
║      🤖  *${botname}*  🤖
╚══════════════════════╝

👋 Hello *@${m.pushName}*  
Welcome to your smart assistant

╭─ ❖ BOT STATUS ❖ ─╮
│ ⚡ Prefix : ${effectivePrefix}
│ 🔰 Mode   : ${mode}
│ 🧠 Engine : Baileys MD
╰──────────────────╯

╭─ ❖ MAIN COMMANDS ❖ ─╮
│ 🌟 ${prefix}fullmenu
│ 👨‍💻 ${prefix}dev
│ 📡 ${prefix}ping
│ ⚙ ${prefix}settings
╰──────────────────────╯

╭──❖ CATEGORY MENUS ❖──╮
│ 📂 ${prefix}generalmenu
│ ⚙ ${prefix}settingsmenu
│ 💱 ${prefix}businessmenu
│ 👑 ${prefix}ownermenu
│ ☁ ${prefix}herokumenu
│ 🔐 ${prefix}privacymenu
│ 👥 ${prefix}groupmenu
│ 🤖 ${prefix}aimenu
│ ⬇ ${prefix}downloadmenu
│ 🎨 ${prefix}editingmenu
│ 🖌 ${prefix}logomenu
│ 🔞 ${prefix}+18menu
│ 🧰 ${prefix}utilsmenu
│ 📖 ${prefix}godmenu
╰───────────────────────╯

✨ Tip: Use the *buttons below* for faster navigation

══════════════════════
© Powered by *${botname}*
`;


        const msg = generateWAMessageFromContent(  
            m.chat,  
            {  
                interactiveMessage: {  
                    header: {  
                        documentMessage: {  
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0&mms3=true',  
                            mimetype: 'image/png',  
                            fileSha256: '+gmvvCB6ckJSuuG3ZOzHsTBgRAukejv1nnfwGSSSS/4=',  
                            fileLength: '1435',  
                            pageCount: 0,  
                            mediaKey: 'MWO6fI223TY8T0i9onNcwNBBPldWfwp1j1FPKCiJFzw=',  
                            fileName: 'DML-MD',  
                            fileEncSha256: 'ZS8v9tio2un1yWVOOG3lwBxiP+mNgaKPY9+wl5pEoi8=',  
                            directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0',  
                            mediaKeyTimestamp: '1756370084',  
                            jpegThumbnail: pict,  
                        },  
                        hasMediaAttachment: true,  
                    },  
                    body: { text: menuText },  
                    footer: { text: `POWERED BY ${botname}` },  
                    nativeFlowMessage: {  
                        buttons: [  
                            {  
                                name: 'cta_url',  
                                buttonParamsJson: JSON.stringify({  
                                    display_text: 'GitHub Repo',  
                                    url: 'https://github.com/MLILA17/DML-MD',  
                                    merchant_url: 'https://github.com/MLILA17/DML-MD',  
                                }),  
                            },  
                            {  
                                name: 'single_select',  
                                buttonParamsJson: JSON.stringify({  
                                    title: 'VIEW OPTIONS ',  
                                    sections: [  
                                        {  
                                            title: '⌜ 𝘾𝙤𝙧𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 ⌟',  
                                            highlight_label: '© 丨Dml',  
                                            rows: [  
                                                { title: '𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮', description: 'Display all commands', id: `${prefix}fullmenu` },  
                                                { title: '𝐃𝐞𝐯', description: "send developer contact", id: `${prefix}dev` },  
                                            ],  
                                        },  
                                        {  
                                            title: 'ℹ 𝙄𝙣𝙛𝙤 𝘽𝙤𝙩',  
                                            highlight_label: '© 丨Dml',  
                                            rows: [  
                                                { title: '𝐏𝐢𝐧𝐠', description: '', id: `${prefix}ping` },  
                                                { title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬', description: 'show bot settings', id: `${prefix}settings` },  
                                            ],  
                                        },  
                                        {  
                                            title: '📜 𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 𝙈𝙚𝙣𝙪𝙨',  
                                            highlight_label: '© 丨Dml',  
                                            rows: [  
                                                { title: '𝐆𝐞𝐧𝐞𝐫𝐚𝐥𝐌𝐞𝐧𝐮', description: 'General commands', id: `${prefix}generalmenu` },  
                                                { title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬𝐌𝐞𝐧𝐮', description: 'Bot settings commands', id: `${prefix}settingsmenu` },  
                                                { title: '𝐁𝐮𝐬𝐢𝐧𝐞𝐬𝐬𝐌𝐞𝐧𝐮', description: 'Bot Currency exchange commands', id: `${prefix}businessmenu` },  
                                                { title: '𝐎𝐰𝐧𝐞𝐫𝐌𝐞𝐧𝐮', description: 'Owner only commands', id: `${prefix}ownermenu` },  
                                                { title: '𝐇𝐞𝐫𝐨𝐤𝐮𝐌𝐞𝐧𝐮', description: 'Heroku related commands', id: `${prefix}herokumenu` },  
                                                { title: '𝐏𝐫𝐢𝐯𝐚𝐜𝐲𝐌𝐞𝐧𝐮', description: 'Privacy commands', id: `${prefix}privacymenu` },  
                                                { title: '𝐆𝐫𝐨𝐮𝐩𝐌𝐞𝐧𝐮', description: 'Group management', id: `${prefix}groupmenu` },  
                                                { title: '𝐒𝐞𝐚𝐫𝐜𝐡𝐌𝐞𝐧𝐮', description: 'Search & lookup commands', id: `${prefix}searchmenu` },
                                                { title: '𝐀𝐈𝐌𝐞𝐧𝐮', description: 'AI & chat commands', id: `${prefix}aimenu` },  
                                                { title: '𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐌𝐞𝐧𝐮', description: 'Media downloaders', id: `${prefix}downloadmenu` },  
                                                { title: '𝐄𝐝𝐢𝐭𝐢𝐧𝐠𝐌𝐞𝐧𝐮', description: 'Media editing tools', id: `${prefix}editingmenu` },  
                                                { title: '𝐋𝐨𝐠𝐨𝐌𝐞𝐧𝐮', description: 'Logo & text makers', id: `${prefix}logomenu` },
                                                { title: '𝗚𝗼𝗱 𝐌𝐞𝐧𝐮', description: 'Read Holy Bible and Quran', id: `${prefix}godmenu` },
                                                { title: '+𝟏𝟖𝐌𝐞𝐧𝐮', description: 'NSFW commands (18+)', id: `${prefix}+18menu` },  
                                                { title: '𝐔𝐭𝐢𝐥𝐬𝐌𝐞𝐧𝐮', description: 'Utility commands', id: `${prefix}utilsmenu` },  
                                            ],  
                                        },  
                                    ],  
                                }),  
                            },  
                        ],  
                    },  
                    contextInfo: {  
                        externalAdReply: {  
                            title: `${botname}`,  
                            body: `Hi, ${m.pushName}! How are you`,  
                            mediaType: 1,  
                            thumbnail: pict,  
                            mediaUrl: '',  
                            sourceUrl: 'https://github.com/MLILA17/DML-MD',  
                            showAdAttribution: false,  
                            renderLargerThumbnail: true,  
                        },  
                    },  
                },  
            },  
            { quoted: m }  
        );  

        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });  
    },
};
// DML
