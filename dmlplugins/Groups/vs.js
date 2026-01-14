const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'vs',
  aliases: ['voicestatus', 'vpost', 'voicepost'],
  description: 'Post your voice note as group status',
  
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, sender, botname } = context;

    const simpleBox = (text) => 
`┌─〔 🔊 VOICE STATUS 〕─┐
│
│ ${text.replace(/\n/g, '\n│ ')}
│
└──────────────────┘`;

    try {
      // Quick validations
      if (!IsGroup) {
        return client.sendText(m.chat, simpleBox('Only works in groups.'), m);
      }
      if (!isBotAdmin) {
        return client.sendText(m.chat, simpleBox('Make me admin first.'), m);
      }

      // Get the voice message
      const quoted = m.quoted || m;
      const mime = (quoted.msg || quoted).mimetype || '';
      const isVoice = mime.includes('audio/ogg') || mime.includes('audio/mp4');

      // Check if it's a voice message
      if (!isVoice) {
        return client.sendText(m.chat,
          simpleBox(
            `HOW TO USE:\n` +
            `1. Record voice note (hold mic 🎤)\n` +
            `2. Reply to it with: ${prefix}vs\n` +
            `3. That's it! It will post as status.\n\n` +
            `EXAMPLE:\n` +
            `You: (records voice)\n` +
            `You: ${prefix}vs`
          ),
          m
        );
      }

      // Show processing message
      await client.sendText(m.chat, simpleBox('Processing your voice...'), m);

      // Download voice
      const voiceBuffer = await client.downloadMediaMessage(quoted);
      
      if (!voiceBuffer) {
        throw new Error('Failed to get voice');
      }

      // Create caption
      const username = sender.split('@')[0];
      const date = new Date();
      const caption = `
🎤 VOICE STATUS

Posted by: @${username}
Time: ${date.toLocaleTimeString()}

🔊 Tap to listen
      `.trim();

      // Post as status
      await client.sendMessage(m.chat, {
        groupStatusMessage: {
          audio: voiceBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          caption: caption
        }
      });

      // Send confirmation
      await client.sendText(m.chat,
        simpleBox(`✅ Voice status posted!\n\n👤 Your voice is now group status.`),
        m
      );

    } catch (error) {
      await client.sendText(
        m.chat,
        simpleBox(`Error: ${error.message}\n\nMake sure you're replying to a voice note.`),
        m
      );
    }
  }
};
