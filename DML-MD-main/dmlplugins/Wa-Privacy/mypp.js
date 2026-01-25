module.exports = async (context) => {

const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
    await ownerMiddleware(context, async () => {

    const { client, m, text} = context;

if (!text) {
      m.reply("Provide a setting to be updated. Example:\nmypp all");
      return;
    }


const availablepriv = ['all', 'contacts', 'contact_blacklist', 'none'];

if (!availablepriv.includes(text)) return m.reply(`Choose a setting from this list: ${availablepriv.join('/')}`);

await client.updateProfilePicturePrivacy(text)
        await m.reply(`Profile Picture privacy settings updated to *${text}*`);

})

}