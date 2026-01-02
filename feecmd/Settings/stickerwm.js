const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args } = context;
        const newStickerWM = args.join(" ") || null;  

        let settings = await getSettings();

        if (!settings) {
            return await m.reply('❌ Settings not found.');
        }

        if (newStickerWM !== null) {
            if (newStickerWM === 'null') {
                if (!settings.packname) {
                    return await m.reply(`✅ The bot already has no sticker watermark.`);
                }
                await updateSetting('packname', '');
                await m.reply(`✅ The bot now has no sticker watermark.`);
            } else {
                if (settings.packname === newStickerWM) {
                    return await m.reply(`✅ The sticker watermark was already set to: ${newStickerWM}`);
                }
                await updateSetting('packname', newStickerWM);
                await m.reply(`✅ Sticker watermark has been updated to: ${newStickerWM}`);
            }
        } else {
            await m.reply(`📄 Current sticker watermark: ${settings.packname || 'No sticker watermark set.'}\n\n_Use '${settings.prefix}stickerwm null' to remove the watermark or '${settings.prefix}stickerwm <text>' to set a specific watermark._`);
        }
    });
};