const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, args, text } = context;
        
        if (!text || args.length < 1) {
            return client.sendMessage(m.chat, {
                text: "Usage: !schedule <minutes> <message>\nExample: !schedule 5 Hello everyone in 5 minutes!"
            }, { quoted: m });
        }
        
        const delayMinutes = parseInt(args[0]);
        const message = args.slice(1).join(' ');
        
        if (isNaN(delayMinutes) || delayMinutes <= 0) {
            return client.sendMessage(m.chat, {
                text: "Please provide a valid number of minutes!"
            }, { quoted: m });
        }
        
        await client.sendMessage(m.chat, {
            text: `⏰ Message scheduled in ${delayMinutes} minute(s):\n"${message}"`
        }, { quoted: m });
        
        // Schedule the message
        setTimeout(async () => {
            await client.sendMessage(m.chat, {
                text: `⏰ Scheduled Message:\n${message}`,
                mentions: participants.map(a => a.id)
            });
        }, delayMinutes * 60 * 1000);
    });
};
