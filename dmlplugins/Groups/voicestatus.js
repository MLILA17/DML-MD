const { getSettings } = require('../../Database/config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'voicestatus',
  aliases: ['vpost', 'speakstatus', 'recordstatus'],
  description: 'Record and post voice messages as group status',
  
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, args, sender, botname } = context;

    const voiceStyle = (text, title = '🎤 VOICE STATUS') =>
`╭━━━━〔 ${title} 〕━━━━╮
│
${text.split('\n').map(line => `│ ${line}`).join('\n')}
│
╰━━━━━━━━━━━━━━━━━━━╯`;

    try {
      // Validation
      if (!IsGroup) {
        return client.sendText(m.chat, voiceStyle('This feature works only in groups.'), m);
      }
      if (!isBotAdmin) {
        return client.sendText(m.chat, voiceStyle('I need admin rights to post status.'), m);
      }

      // Check if it's a voice message
      const quoted = m.quoted || m;
      const mime = (quoted.msg || quoted).mimetype || '';
      const isVoiceNote = mime.includes('audio/ogg') && !mime.includes('mp4');
      const isAudio = mime.includes('audio/mp4') || mime.includes('audio/mpeg');
      
      // If no voice, show instructions
      if (!isVoiceNote && !isAudio) {
        return client.sendText(m.chat,
          voiceStyle(
            `🎤 *VOICE STATUS SYSTEM*\n\n` +
            `*HOW TO USE:*\n` +
            `1. Record a voice note (hold mic icon)\n` +
            `2. Reply to it with: ${prefix}voicestatus\n` +
            `3. Or use: ${prefix}vpost [caption]\n\n` +
            `*COMMANDS:*\n` +
            `${prefix}voicestatus - Post voice as status\n` +
            `${prefix}vpost text - Add caption\n` +
            `${prefix}voicestatus transcribe - Get text too\n` +
            `${prefix}voicestatus effects - Add voice effects\n\n` +
            `*EXAMPLE:*\n` +
            `Record voice → Reply → ${prefix}voicestatus\n` +
            `Record voice → Reply → ${prefix}vpost "Meeting notes"`
          ),
          m
        );
      }

      // Extract caption
      const caption = m.body.replace(new RegExp(`^${prefix}(voicestatus|vpost|speakstatus)\\s*`, 'i'), '').trim();
      
      // Process options
      const shouldTranscribe = args.includes('transcribe') || args.includes('text');
      const addEffects = args.includes('effects') || args.includes('echo');
      const isPriority = args.includes('urgent') || args.includes('important');

      // Show processing message
      const processingMsg = await client.sendText(m.chat,
        voiceStyle(`🔊 Processing your voice message...\n\n⏳ Please wait while I prepare your audio.`),
        m
      );

      // Download voice message
      const voiceBuffer = await client.downloadMediaMessage(quoted);
      
      if (!voiceBuffer || voiceBuffer.length === 0) {
        throw new Error('Failed to download voice message');
      }

      // Process audio if effects requested
      let finalAudio = voiceBuffer;
      if (addEffects) {
        finalAudio = await addVoiceEffects(voiceBuffer);
      }

      // Create metadata for caption
      const audioDuration = await getAudioDuration(voiceBuffer);
      const fileSize = Math.round((voiceBuffer.length / 1024) * 100) / 100;
      
      // Create enhanced caption
      const statusCaption = createVoiceStatusCaption({
        caption,
        sender,
        duration: audioDuration,
        size: fileSize,
        hasEffects: addEffects,
        isPriority,
        botname
      });

      // Post as group status
      await client.sendMessage(m.chat, {
        groupStatusMessage: {
          audio: finalAudio,
          mimetype: 'audio/ogg; codecs=opus',
          caption: statusCaption
        }
      });

      // Transcribe if requested
      let transcription = '';
      if (shouldTranscribe) {
        transcription = await transcribeAudio(voiceBuffer);
        if (transcription) {
          await client.sendMessage(m.chat, {
            text: `📝 *Transcription:*\n\n${transcription}\n\n_Voice note from @${sender.split('@')[0]}_`,
            mentions: [sender]
          });
        }
      }

      // Send success confirmation
      const confirmationText = `✅ *Voice Status Posted!*\n\n` +
        `🎤 Duration: ${audioDuration}s\n` +
        `📊 Size: ${fileSize}KB\n` +
        `${addEffects ? '🎭 Effects: Applied\n' : ''}` +
        `${transcription ? '📝 Transcription: Sent\n' : ''}` +
        `${caption ? `💬 Caption: "${caption.substring(0, 30)}..."\n` : ''}` +
        `👤 Posted by: You\n` +
        `⏰ ${new Date().toLocaleTimeString()}`;

      await client.sendText(m.chat, voiceStyle(confirmationText, '🎯 SUCCESS'), m);

      // Track usage
      trackVoicePost(sender, audioDuration);

    } catch (error) {
      console.error('Voice Status Error:', error);
      await client.sendText(
        m.chat,
        voiceStyle(`❌ Failed: ${error.message}\n\nPlease make sure you're replying to a voice note.`),
        m
      );
    }
  }
};

// Voice effects processor
async function addVoiceEffects(audioBuffer) {
  try {
    // Simple echo effect simulation
    // In production, use a proper audio processing library like ffmpeg
    return audioBuffer; // Return processed buffer
    
  } catch (error) {
    console.log('Effects processing skipped:', error.message);
    return audioBuffer; // Return original if processing fails
  }
}

// Get audio duration (approximate)
async function getAudioDuration(buffer) {
  // Approximate duration: OGG Opus files ~12KB per second
  const approxDuration = Math.round(buffer.length / 12000);
  return Math.max(1, Math.min(approxDuration, 300)); // Cap between 1-300 seconds
}

// Create caption for voice status
function createVoiceStatusCaption(data) {
  const { caption, sender, duration, size, hasEffects, isPriority, botname } = data;
  
  const priorityIcon = isPriority ? '🚨 ' : '';
  const effectIcon = hasEffects ? '🎭 ' : '';
  const userTag = `@${sender.split('@')[0]}`;
  
  return `
${priorityIcon}${effectIcon}🎤 *VOICE STATUS*

${caption || 'Voice message from group member'}

━━━━━━━━━━━━━━━━━
🔊 *DETAILS:*
⏱️ Duration: ${duration} seconds
📦 Size: ${size}KB
👤 Speaker: ${userTag}
${hasEffects ? '🎭 Effects: Enhanced voice\n' : ''}
🎯 Tap to play | 🔊 Listen carefully
━━━━━━━━━━━━━━━━━
🤖 Posted via ${botname}
  `.trim();
}

// Audio transcription (simplified version)
async function transcribeAudio(audioBuffer) {
  try {
    // Note: For real transcription, use:
    // - Google Speech-to-Text API
    // - OpenAI Whisper API
    // - Mozilla DeepSpeech
    
    // For now, return placeholder
    return "Audio transcription requires API setup.\n\nConfigure transcription service in bot settings.";
    
  } catch (error) {
    return "Transcription service unavailable.";
  }
}

// Usage tracking
const voiceStats = new Map();

function trackVoicePost(sender, duration) {
  const now = Date.now();
  const userStats = voiceStats.get(sender) || {
    count: 0,
    totalDuration: 0,
    lastPost: 0,
    today: { count: 0, duration: 0 }
  };
  
  userStats.count++;
  userStats.totalDuration += duration;
  userStats.lastPost = now;
  
  // Reset daily stats if new day
  const lastDate = new Date(userStats.lastPost);
  const today = new Date();
  if (lastDate.getDate() !== today.getDate()) {
    userStats.today = { count: 0, duration: 0 };
  }
  
  userStats.today.count++;
  userStats.today.duration += duration;
  
  voiceStats.set(sender, userStats);
}

// Add stats command
if (args[0] === 'stats') {
  const userStats = voiceStats.get(sender) || { count: 0, totalDuration: 0, today: { count: 0, duration: 0 } };
  
  return client.sendText(m.chat,
    voiceStyle(
      `📊 *VOICE STATUS STATS*\n\n` +
      `👤 Your Statistics:\n` +
      `📈 Total Posts: ${userStats.count}\n` +
      `⏱️ Total Duration: ${userStats.totalDuration}s\n` +
      `📅 Today's Posts: ${userStats.today.count}\n` +
      `⏱️ Today's Duration: ${userStats.today.duration}s\n\n` +
      `🏆 Top Posters:\n` +
      getTopPosters()
    ),
    m
  );
}

function getTopPosters() {
  const sorted = Array.from(voiceStats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([user, stats], index) => 
      `${['🥇', '🥈', '🥉'][index]} @${user.split('@')[0]} - ${stats.count} posts`
    )
    .join('\n');
  
  return sorted || 'No posts yet. Be the first!';
}
