const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'vs',
  aliases: ['voicestatus', 'vpost', 'voicepost'],
  description: 'Post replied voice/audio as group status',
  
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, sender } = context;

    try {
      // ========== VALIDATION ==========
      if (!IsGroup) {
        return client.sendText(m.chat, 
          '❌ *Group Only*\nThis command works only in group chats.', 
          m
        );
      }

      if (!isBotAdmin) {
        return client.sendText(m.chat, 
          '🔒 *Admin Required*\nI need admin permissions to post status.', 
          m
        );
      }

      // ========== CHECK IF REPLYING TO AUDIO/VOICE ==========
      if (!m.quoted) {
        return client.sendText(m.chat,
          `🎤 *How to use:*\n\n` +
          `1. *Record or receive* a voice/audio message\n` +
          `2. *Reply* to that audio message\n` +
          `3. Type: \`${prefix}vs\`\n\n` +
          `*Example:*\n` +
          `┌─ You receive/send audio\n` +
          `└─ Reply with "${prefix}vs"\n\n` +
          `✅ It will post as group status`,
          m
        );
      }

      const quoted = m.quoted;
      const quotedMsg = quoted.msg || quoted;
      
      // Check if quoted message is audio/voice
      const isAudio = quotedMsg.mimetype?.includes('audio/');
      const isVoiceNote = quotedMsg.ptt || quotedMsg.mimetype?.includes('ogg');
      
      if (!isAudio && !isVoiceNote) {
        return client.sendText(m.chat,
          `❌ *Not an audio message*\n\n` +
          `Please reply to:\n` +
          `• A voice note (🎤 icon)\n` +
          `• An audio file\n` +
          `• Any audio message\n\n` +
          `Then use: \`${prefix}vs\``,
          m
        );
      }

      // ========== DOWNLOAD AND POST ==========
      // Show processing
      await client.sendText(m.chat, 
        `⏳ *Processing audio...*\nPlease wait while I prepare your voice status.`, 
        m
      );

      // Download the audio
      const audioBuffer = await client.downloadMediaMessage(quoted);
      
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Failed to download audio');
      }

      // Get sender info
      const senderId = quotedMsg.sender || m.sender;
      const username = senderId.split('@')[0];
      
      // Determine mime type
      const mimeType = quotedMsg.mimetype?.includes('ogg') ? 
        'audio/ogg; codecs=opus' : 
        'audio/mp4';

      // Create caption
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const caption = `
🎤 *VOICE STATUS*

👤 From: @${username}
🕐 ${time}

🔊 Tap to play | 🔊 Listen carefully
      `.trim();

      // ========== POST AS GROUP STATUS ==========
      await client.sendMessage(m.chat, {
        groupStatusMessage: {
          audio: audioBuffer,
          mimetype: mimeType,
          caption: caption
        }
      });

      // ========== SEND CONFIRMATION ==========
      await client.sendText(m.chat,
        `✅ *Voice Status Posted!*\n\n` +
        `• Status: ✅ Active\n` +
        `• From: @${username}\n` +
        `• Time: ${time}\n\n` +
        `🎯 *Posted as group status for everyone to see.*`,
        m
      );

    } catch (error) {
      console.error('Voice Status Error:', error);
      await client.sendText(m.chat,
        `❌ *Failed to post status*\n\n` +
        `Error: ${error.message}\n\n` +
        `Make sure:\n` +
        `1. I'm group admin\n` +
        `2. You're replying to audio\n` +
        `3. Audio is not too large`,
        m
      );
    }
  }
};
