const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
`┏━━〔 ⚠ SYSTEM WARNING 〕━━┓
┃ ▸ Group-only command
┃ ▸ This won’t work in private
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        return await m.reply(
`┏━━〔 ⚠ DATABASE ERROR 〕━━┓
┃ ▸ No global settings found
┃ ▸ Action aborted
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        );
      }

      let groupSettings = await getGroupSetting(jid);
      if (!groupSettings) {
        return await m.reply(
`┏━━〔 ⚠ GROUP ERROR 〕━━┓
┃ ▸ No group settings found
┃ ▸ Try again later
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        );
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants
        .filter(p => p.admin !== null)
        .map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      if (value === 'on' || value === 'off') {
        if (!isBotAdmin) {
          return await m.reply(
`┏━━〔 🚫 PERMISSION DENIED 〕━━┓
┃ ▸ Bot is not admin
┃ ▸ Grant admin access first
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
          );
        }

        const action = value === 'on';

        if (isEnabled === action) {
          return await m.reply(
`┏━━〔 ℹ STATUS CHECK 〕━━┓
┃ ▸ Antiforeign already ${value.toUpperCase()}
┃ ▸ No changes applied
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
          );
        }

        await updateGroupSetting(jid, 'antiforeign', action);

        await m.reply(
`┏━━〔 ✅ SYSTEM UPDATE 〕━━┓
┃ ▸ Antiforeign ${value.toUpperCase()}
┃ ▸ Rule enforcement active
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        );
      } else {
        await m.reply(
`┏━━〔 📊 ANTIFOREIGN STATUS 〕━━┓
┃ ▸ Current: ${isEnabled ? 'ON' : 'OFF'}
┃ ▸ Use:
┃   ${prefix}antiforeign on
┃   ${prefix}antiforeign off
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        );
      }
    } catch (error) {
      console.error('[Antiforeign] Error in command:', error);
      await m.reply(
`┏━━━〔 ❌ SYSTEM FAILURE 〕━━━┓
┃ ▸ Operation failed
┃ ▸ Database error suspected
┃ ▸ Try again later
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
// DML
