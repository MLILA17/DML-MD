const linkMiddleware = require('../../utility/botUtil/linkMiddleware');

module.exports = async (context) => {
    await linkMiddleware(context, async () => {
        const { client, m } = context;

        try {
            let response = await client.groupInviteCode(m.chat); 
            await client.sendText(m.chat, 
`╭┈┈┈┈━━━━━━┈┈┈┈◈
 │❒ *GROUP LINK* ❒
 ╰┈┈┈┈━━━━━━┈┈┈┈◈◈
            
https://chat.whatsapp.com/${response}

📌 *Share this link to invite members*
🔗 *Link generated successfully*`, 
            m, { detectLink: true }); 

        } catch (error) {
            console.error('Error generating group link:', error);
            await client.sendText(m.chat, 
`╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ *ERROR* ❒
╰┈┈┈┈━━━━━━┈┈┈┈◈

❌ Failed to generate group link.
Please try again later.`, 
            m);
        }
    });
};