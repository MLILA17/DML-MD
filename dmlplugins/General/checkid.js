await client.sendMessage(m.chat, {
  interactiveMessage: {
    header: `🔗 ${type} ID Found!`,
    title: `Link: ${link}\n\nJID: \`${id}\`\n\nType: ${type}`,
    footer: `⚡ Powered by ${botname}`,
    buttons: [
      // Copy JID button
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: 'Copy JID',
          id: 'copy_jid_code',
          copy_code: id
        })
      },
      // Repo button (works as URL)
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Repo',
          id: 'open_repo',
          url: 'https://github.com/MLILA17/DML-MD'
        })
      }
    ]
  }
}, { quoted: m });
