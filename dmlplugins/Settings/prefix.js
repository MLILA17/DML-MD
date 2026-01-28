const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;
        const newPrefix = args[0];
        const settings = await getSettings();

        // Disable prefix
        if (newPrefix === 'null') {
            if (!settings.prefix) {
                return await m.reply(
`╭─〔 ⚠ PREFIX STATUS 〕─╮
│ ❎ The prefix is already disabled.
│ ⚠ No changes have been made.
╰────────────────────╯`
                );
            }

            await updateSetting('prefix', '');
            return await m.reply(
`╭─〔 ✅ PREFIX REMOVED 〕─╮
│ ❎ The prefix has been successfully removed.
│ 🙌 Bot is now operating without a prefix.
╰────────────────────╯`
            );
        }

        // Update prefix
        if (newPrefix) {
            if (settings.prefix === newPrefix) {
                return await m.reply(
`╭─〔 ⚠ PREFIX STATUS 〕─╮
│ ⏭ The prefix is already set to "${newPrefix}".
│ 🚨 Please choose a different symbol.
╰────────────────────╯`
                );
            }

            await updateSetting('prefix', newPrefix);
            return await m.reply(
`╭─〔 ✅ PREFIX UPDATED 〕─╮
│ 🚀 New prefix set: ${newPrefix}
│ ▶ Update completed successfully.
╰────────────────────╯`
            );
        }

        // Show current prefix info
        await m.reply(
`╭─〔 ℹ PREFIX INFORMATION 〕─╮
│ ♻ Current Prefix: ${settings.prefix || 'Disabled'}
│ 🔰 Use "${settings.prefix || '.'}prefix null" to disable the prefix.
│ 🚀 Use "${settings.prefix || '.'}prefix <symbol>" to set a new prefix.
╰────────────────────╯`
        );
    });
};
