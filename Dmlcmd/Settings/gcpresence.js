const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;
        const value = args[0]?.toLowerCase();
        const jid = m.chat;

        if (!jid.endsWith('@g.us')) {
            return await m.reply('❌ This command can only be used in groups.');
        }

        const settings = await getSettings();
        const prefix = settings.prefix;

        let groupSettings = await getGroupSetting(jid);
        let isEnabled = groupSettings?.gcpresence === true;

        if (value === 'on' || value === 'off') {
            const action = value === 'on';

            if (isEnabled === action) {
                return await m.reply(`✅ GCPresence is already ${value.toUpperCase()}.`);
            }

            await updateGroupSetting(jid, 'gcpresence', action ? 'true' : 'false');
            await m.reply(`✅ GCPresence has been turned ${value.toUpperCase()} for this group. Bot will now simulate fake typing and recording.`);
        } else {
            await m.reply(`📄 Current GCPresence setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n _Use ${prefix}gcpresence on or ${prefix}gcpresence off to change it._`);
        }
    });
};