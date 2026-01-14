const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'vs',
  aliases: ['voicestatus', 'vpost', 'voicepost'],
  description: 'Send voice message to post as status in your groups',
  
  run: async (context) => {
    const { client, m, prefix, sender } = context;

    try {
      // ========== CHECK IF REPLYING TO AUDIO/VOICE ==========
      if (!m.quoted) {
        return client.sendText(m.chat,
          `🎤 *Voice Status - Private Mode*\n\n` +
          `*How to use in DM:*\n` +
          `1. Send me a voice/audio message\n` +
          `2. Reply to it with: \`${prefix}vs\`\n` +
          `3. I'll save it for group posting\n\n` +
          `*Next step:*\n` +
          `Go to any group where I'm admin and use:\n` +
          `\`${prefix}postvs\` to post your saved voice\n\n` +
          `*Example:*\n` +
          `You (in DM): [sends voice]\n` +
          `You (in DM): ${prefix}vs\n` +
          `✅ Voice saved!\n` +
          `You (in group): ${prefix}postvs\n` +
          `✅ Voice posted as status!`,
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
          `• An audio file\n\n` +
          `Then use: \`${prefix}vs\``,
          m
        );
      }

      // ========== DOWNLOAD AND SAVE VOICE ==========
      // Show processing
      await client.sendText(m.chat, 
        `⏳ *Processing your voice...*\nPlease wait while I save your audio.`, 
        m
      );

      // Download the audio
      const audioBuffer = await client.downloadMediaMessage(quoted);
      
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Failed to download audio');
      }

      // Save to user's storage (simplified - in real use, save to database)
      const userVoiceStorage = getUserVoiceStorage(sender);
      userVoiceStorage.voiceBuffer = audioBuffer;
      userVoiceStorage.mimeType = quotedMsg.mimetype?.includes('ogg') ? 
        'audio/ogg; codecs=opus' : 'audio/mp4';
      userVoiceStorage.timestamp = Date.now();
      userVoiceStorage.sender = sender;
      
      saveUserVoiceStorage(sender, userVoiceStorage);

      // ========== SEND CONFIRMATION ==========
      await client.sendText(m.chat,
        `✅ *Voice Saved Successfully!*\n\n` +
        `• Status: ✅ Ready to post\n` +
        `• Size: ${Math.round(audioBuffer.length / 1024)} KB\n` +
        `• Saved at: ${new Date().toLocaleTimeString()}\n\n` +
        `*Next Steps:*\n` +
        `1. Go to any group where I'm admin\n` +
        `2. Use: \`${prefix}postvs\`\n` +
        `3. I'll post your voice as group status\n\n` +
        `*Note:* Voice is saved temporarily (24 hours)`,
        m
      );

    } catch (error) {
      console.error('Voice Status Error:', error);
      await client.sendText(m.chat,
        `❌ *Failed to save voice*\n\n` +
        `Error: ${error.message}\n\n` +
        `Please try again with a shorter voice note.`,
        m
      );
    }
  }
};

// ========== POSTVS COMMAND (FOR GROUPS) ==========
// Add this as a separate command or in the same file

const postVSCommand = {
  name: 'postvs',
  aliases: ['postvoice', 'pv'],
  description: 'Post your saved voice as group status',
  
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, sender } = context;

    try {
      if (!IsGroup) {
        return client.sendText(m.chat, 
          '❌ *Group Required*\nUse this command in a group to post status.', 
          m
        );
      }

      if (!isBotAdmin) {
        return client.sendText(m.chat, 
          '🔒 *Admin Required*\nI need admin permissions to post status.', 
          m
        );
      }

      // Get user's saved voice
      const userVoiceStorage = getUserVoiceStorage(sender);
      
      if (!userVoiceStorage || !userVoiceStorage.voiceBuffer) {
        return client.sendText(m.chat,
          `❌ *No saved voice found*\n\n` +
          `First save a voice in private chat:\n` +
          `1. DM me a voice message\n` +
          `2. Reply with: \`${prefix}vs\`\n` +
          `3. Then use \`${prefix}postvs\` here\n\n` +
          `*In DM:*\n` +
          `You → Voice → Reply with ${prefix}vs`,
          m
        );
      }

      // Check if voice is too old (24 hours)
      const hoursOld = (Date.now() - userVoiceStorage.timestamp) / (1000 * 60 * 60);
      if (hoursOld > 24) {
        return client.sendText(m.chat,
          `❌ *Voice expired*\n\n` +
          `Your saved voice is older than 24 hours.\n` +
          `Please save a new voice in DM first.`,
          m
        );
      }

      // Show processing
      await client.sendText(m.chat, 
        `⏳ *Posting your voice status...*`, 
        m
      );

      // Get username
      const username = sender.split('@')[0];
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Create caption
      const caption = `
🎤 *VOICE STATUS*

👤 From: @${username}
🕐 ${time}

🔊 Tap to play
      `.trim();

      // Post as group status
      await client.sendMessage(m.chat, {
        groupStatusMessage: {
          audio: userVoiceStorage.voiceBuffer,
          mimetype: userVoiceStorage.mimeType || 'audio/mp4',
          caption: caption
        }
      });

      // Send confirmation
      await client.sendText(m.chat,
        `✅ *Voice Status Posted!*\n\n` +
        `• Status: ✅ Active\n` +
        `• From: @${username}\n` +
        `• Time: ${time}\n\n` +
        `🎯 *Posted as group status for everyone to see.*`,
        m
      );

      // Clear the saved voice after posting
      clearUserVoiceStorage(sender);

    } catch (error) {
      console.error('PostVS Error:', error);
      await client.sendText(m.chat,
        `❌ *Failed to post status*\n\n` +
        `Error: ${error.message}\n\n` +
        `Please try saving a new voice in DM.`,
        m
      );
    }
  }
};

// ========== STORAGE FUNCTIONS ==========
// Simple in-memory storage
const userVoices = new Map();

function getUserVoiceStorage(userId) {
  return userVoices.get(userId) || {};
}

function saveUserVoiceStorage(userId, data) {
  userVoices.set(userId, data);
}

function clearUserVoiceStorage(userId) {
  userVoices.delete(userId);
}

// Export both commands
module.exports = [module.exports, postVSCommand];
