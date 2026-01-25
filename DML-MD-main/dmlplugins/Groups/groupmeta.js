const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, text, prefix, pict } = context;

        const args = text.trim().split(/ +/);
        const command = args[0]?.toLowerCase() || '';
        const newText = args.slice(1).join(' ').trim();

        switch (command) {
            case 'setgroupname':
                if (!newText) {
                    return m.reply(
`╭─〔 ⚠️ Missing Name 〕─╮
│ Please provide a new
│ group name.
│
│ Usage:
│ ${prefix}setgroupname <new name>
╰─────────────────────╯`
                    );
                }

                if (newText.length > 100) {
                    return m.reply(
`╭─〔 ❌ Name Too Long 〕─╮
│ Group name must not
│ exceed 100 characters.
╰─────────────────╯`
                    );
                }

                try {
                    await client.groupUpdateSubject(m.chat, newText);
                    await m.reply(
`╭─〔 ✅ Group Updated 〕─╮
│ Group name changed to:
│ "${newText}"
╰─────────────────╯`,
                        {
                            contextInfo: {
                                externalAdReply: {
                                    title: `DML-MD`,
                                    body: `Group Update`,
                                    previewType: "PHOTO",
                                    thumbnail: pict,
                                    sourceUrl: 'https://github.com/MLILA17/DML-MD'
                                }
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error updating group subject:', error);
                    await m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to update
│ the group name.
╰───────────╯`
                    );
                }
                break;

            case 'setgroupdesc':
                if (!newText) {
                    return m.reply(
`╭─〔 ⚠️ Missing Description 〕─╮
│ Please provide a new
│ group description.
│
│ Usage:
│ ${prefix}setgroupdesc <description>
╰─────────────────────╯`
                    );
                }

                try {
                    await client.groupUpdateDescription(m.chat, newText);
                    await m.reply(
`╭─〔 ✅ Group Updated 〕─╮
│ Group description
│ updated successfully.
╰─────────────────╯`,
                        {
                            contextInfo: {
                                externalAdReply: {
                                    title: `DML-MD`,
                                    body: `Group Update`,
                                    previewType: "PHOTO",
                                    thumbnail: pict,
                                    sourceUrl: 'https://github.com/MLILA17/DML-MD'
                                }
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error updating group description:', error);
                    await m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to update
│ the group description.
╰────────────╯`
                    );
                }
                break;

            case 'setgrouprestrict':
                const action = newText.toLowerCase();
                if (!['on', 'off'].includes(action)) {
                    return m.reply(
`╭─〔 ⚙️ Usage 〕─╮
│ ${prefix}setgrouprestrict <on | off>
╰──────────────╯`
                    );
                }

                try {
                    const restrict = action === 'on';
                    await client.groupSettingUpdate(
                        m.chat,
                        restrict ? 'locked' : 'unlocked'
                    );

                    await m.reply(
`╭─〔 🔐 Group Settings 〕─╮
│ Editing is now:
│ ${restrict ? 'Admins only' : 'Open to all members'}
╰─────────────────────╯`,
                        {
                            contextInfo: {
                                externalAdReply: {
                                    title: `DML-MD`,
                                    body: `Group Update`,
                                    previewType: "PHOTO",
                                    thumbnail: pict,
                                    sourceUrl: 'https://github.com/MLILA17/DML-MD'
                                }
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error updating group settings:', error);
                    await m.reply(
`╭─〔 ❌ Error 〕─╮
│ Failed to update
│ group settings.
╰───────────╯`
                    );
                }
                break;

            default:
                await m.reply(
`╭─〔 ❓ Invalid Command 〕─╮
│ Available commands:
│ • ${prefix}setgroupname
│ • ${prefix}setgroupdesc
│ • ${prefix}setgrouprestrict
╰───────────────────╯`
                );
        }
    });
};
