const { getSettings } = require('../../Database/config');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'voiceannounce',
  aliases: ['vannounce', 'voicepost', 'speak'],
  description: 'Create AI-powered voice announcements for group status',
  category: 'Group Management',
  
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, args, sender, botname } = context;

    // Enhanced UI with voice theme
    const voiceUI = (text, title = '🎤 VOICE ANNOUNCEMENT') =>
`╔═══〔 ${title} 〕═══╗
║
${text.split('\n').map(line => `║ ${line}`).join('\n')}
║
╚══════════════════╝`;

    try {
      // Validation
      if (!IsGroup) {
        return client.sendText(m.chat, voiceUI('❌ This feature requires a group chat.'), m);
      }
      if (!isBotAdmin) {
        return client.sendText(m.chat, voiceUI('🔒 Admin privileges required to post voice announcements.'), m);
      }

      const settings = await getSettings();
      if (!settings) throw new Error('Configuration unavailable');

      // Parse arguments for voice customization
      const fullText = args.join(' ').trim();
      if (!fullText) {
        return client.sendText(m.chat, 
          voiceUI(
            `📝 *How to use:*\n\n` +
            `${prefix}voiceannounce [text]\n` +
            `${prefix}vannounce [text] --voice=male\n` +
            `${prefix}speak [text] --speed=0.8\n\n` +
            `*Options:*\n` +
            `--voice=male/female/child/robot\n` +
            `--speed=0.5 to 2.0\n` +
            `--lang=en/es/fr/de\n\n` +
            `*Example:*\n` +
            `${prefix}vannounce Meeting at 5 PM --voice=female --speed=1.2`
          ),
          m
        );
      }

      // Extract voice parameters
      const params = {
        text: fullText.replace(/--\w+=[\w.]+/g, '').trim(),
        voice: extractParam(fullText, 'voice') || 'female',
        speed: parseFloat(extractParam(fullText, 'speed')) || 1.0,
        lang: extractParam(fullText, 'lang') || 'en',
        emotion: extractParam(fullText, 'emotion') || 'neutral'
      };

      // Show processing message
      await client.sendText(m.chat, 
        voiceUI(`🎵 Generating voice announcement...\n\nVoice: ${params.voice}\nSpeed: ${params.speed}x\nLanguage: ${params.lang}`),
        m
      );

      // Generate AI voice
      const audioBuffer = await generateAIVoice(params);
      
      if (!audioBuffer) {
        throw new Error('Voice generation failed');
      }

      // Create enhanced caption with voice details
      const caption = createVoiceCaption(params, sender, botname);

      // Post as group status
      await client.sendMessage(m.chat, {
        groupStatusMessage: {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          caption: caption
        }
      });

      // Send success message with voice preview
      const previewText = params.text.length > 50 
        ? params.text.substring(0, 50) + '...' 
        : params.text;

      await client.sendText(m.chat,
        voiceUI(
          `✅ *Voice Announcement Posted!*\n\n` +
          `🔊 Voice: ${params.voice.toUpperCase()}\n` +
          `📏 Length: ${Math.ceil(audioBuffer.length / 1024)}KB\n` +
          `🎚️ Speed: ${params.speed}x\n` +
          `🌐 Language: ${params.lang.toUpperCase()}\n\n` +
          `📝 Preview:\n"${previewText}"\n\n` +
          `⏰ ${new Date().toLocaleTimeString()}`
        ),
        m
      );

      // Optional: Send text version for accessibility
      await client.sendMessage(m.chat, {
        text: `📢 *Text Version:*\n\n${params.text}\n\n_Voice announcement created by ${botname}_`,
        mentions: [sender]
      });

    } catch (error) {
      console.error('Voice Announcement Error:', error);
      await client.sendText(
        m.chat,
        voiceUI(`❌ Voice generation failed:\n${error.message}\n\nPlease try shorter text or different settings.`),
        m
      );
    }
  }
};

// Voice generation using free TTS API
async function generateAIVoice(params) {
  try {
    // Using Google TTS API (free tier)
    const ttsUrl = `https://translate.google.com/translate_tts`;
    
    const response = await axios.get(ttsUrl, {
      params: {
        ie: 'UTF-8',
        q: params.text,
        tl: params.lang,
        client: 'tw-ob',
        total: '1',
        idx: '0',
        textlen: params.text.length,
        prev: 'input',
        ttsspeed: params.speed
      },
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return Buffer.from(response.data);
    
  } catch (error) {
    // Fallback to alternative TTS service
    return await generateFallbackVoice(params);
  }
}

// Alternative voice generation
async function generateFallbackVoice(params) {
  const voices = {
    male: 'en-US_AllisonV3Voice',
    female: 'en-US_AllisonV3Voice',
    child: 'en-US_AllisonV3Voice',
    robot: 'en-US_AllisonV3Voice'
  };

  const voiceId = voices[params.voice] || voices.female;
  
  // Using IBM Watson TTS (free tier alternative)
  const response = await axios.post(
    'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/.../v1/synthesize',
    {
      text: params.text,
      voice: voiceId,
      accept: 'audio/mp3'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mp3'
      },
      responseType: 'arraybuffer'
    }
  );

  return Buffer.from(response.data);
}

function extractParam(text, paramName) {
  const regex = new RegExp(`--${paramName}=([\\w.]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

function createVoiceCaption(params, sender, botname) {
  const voiceEmojis = {
    male: '👨',
    female: '👩',
    child: '🧒',
    robot: '🤖'
  };

  const emotionIcons = {
    neutral: '😐',
    happy: '😊',
    sad: '😢',
    excited: '🎉',
    urgent: '🚨'
  };

  const emoji = voiceEmojis[params.voice] || '🎤';
  const emotionIcon = emotionIcons[params.emotion] || '🎯';

  return `
${emoji} *VOICE ANNOUNCEMENT* ${emotionIcon}

📢 ${params.text}

━━━━━━━━━━━━━━
🔊 Voice: ${params.voice.toUpperCase()}
🎚️ Speed: ${params.speed}x
🌐 Language: ${params.lang.toUpperCase()}
🕐 Generated: ${new Date().toLocaleTimeString()}
🤖 Powered by: ${botname}
━━━━━━━━━━━━━━

🔊 Tap to play | 📌 Listen carefully
  `.trim();
}

// Optional: Voice history tracking
const voiceHistory = new Map();

function trackVoiceUsage(sender, params) {
  const history = voiceHistory.get(sender) || [];
  history.push({
    text: params.text.substring(0, 100),
    voice: params.voice,
    timestamp: Date.now()
  });
  
  // Keep only last 10 entries
  if (history.length > 10) history.shift();
  voiceHistory.set(sender, history);
}
