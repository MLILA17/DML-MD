module.exports = {
    name: 'fancy',
    aliases: ['fancytext', 'style', 'stylish'],
    description: 'Replies with your text in multiple fancy styles',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        const text = args.join(' ');

        if (!text) return m.reply(`Usage: ${prefix}fancy <text>`);

        await client.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        // Unicode fancy styles
        const fancyStyles = [
            { name: 'Bold', map: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭abcdefghijklmnopqrstuvwxyz' },
            { name: 'Italic', map: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍abcdefghijklmnopqrstuvwxyz' },
            { name: 'Bold Italic', map: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁abcdefghijklmnopqrstuvwxyz' },
            { name: 'Script', map: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩abcdefghijklmnopqrstuvwxyz' },
            { name: 'Bubble', map: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ' },
            { name: 'Small Caps', map: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢabcdefghijklmnopqrstuvwxyz' }
        ];

        // Convert function
        const toFancy = (input, map) => {
            const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            return input.split('').map(c => {
                const idx = normal.indexOf(c);
                return idx >= 0 ? map[idx] : c;
            }).join('');
        };

        // Build message
        let msg = `*Fancy styles for:* ${text}\n\n`;
        fancyStyles.forEach((style, i) => {
            msg += `*${i + 1}. ${style.name}:* ${toFancy(text, style.map)}\n`;
        });

        msg += `\n> Powered by Dml`;

        await client.sendMessage(m.chat, { text: msg }, { quoted: m });
    }
};
