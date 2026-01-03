const { getGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m } = context;

        const jid = m.chat;
        console.log(`Received request for group: ${jid}`);

        if (!jid.endsWith('@g.us')) {
            console.log('The command was not issued in a group chat.');
            return await m.reply('❌ This command can only be used in groups.');
        }

        console.log(`Fetching group settings for group: ${jid}`);
        let groupSettings = await getGroupSetting(jid);

        if (!groupSettings) {
            console.log(`No settings found for group: ${jid}`);
            return await m.reply('❌ No group settings found.');
        }

        console.log(`Group settings for ${jid}: ${JSON.stringify(groupSettings)}`);

        let response = `*Group Settings for ${jid}*\n`;
        response += `🔘 *Antilink*: ${groupSettings.antilink ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Antidelete*: ${groupSettings.antidelete ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Events*: ${groupSettings.events ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Antitag*: ${groupSettings.antitag ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *GCPresence*: ${groupSettings.gcpresence ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Antiforeign*: ${groupSettings.antiforeign ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Antidemote*: ${groupSettings.antidemote ? '✅ ON' : '❌ OFF'}\n`;
        response += `🔘 *Antipromote*: ${groupSettings.antipromote ? '✅ ON' : '❌ OFF'}\n`;

        await m.reply(response);
    });
};