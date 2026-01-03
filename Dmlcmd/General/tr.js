const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    name: 'translate',
    aliases: ['tr', 'trans'],
    description: 'Translates text to different languages',
    run: async (context) => {
        const { client, m, prefix } = context;

        const formatStylishReply = (message) => {
            return `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈\n┋❒ ${message}\n◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈`;
        };

        const fullText = m.body.replace(new RegExp(`^${prefix}(translate|tr|trans)\\s*`, 'i'), '').trim();

        if (!fullText && !m.quoted?.text) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply(`How to use:\n• ${prefix}tr id hello world\n• ${prefix}tr ja Hello how are you?\n• Reply to a message with: ${prefix}tr en`)
            }, { quoted: m });
        }

        let lang, text;

        if (m.quoted?.text) {
            lang = fullText || 'en';
            text = m.quoted.text;
        } else {
            const parts = fullText.split(' ');
            if (parts.length >= 2 && parts[0].length === 2) {
                lang = parts[0];
                text = parts.slice(1).join(' ');
            } else {
                lang = 'en';
                text = fullText;
            }
        }

        try {
            await client.sendMessage(m.chat, {
                text: formatStylishReply(`Translating to ${lang.toUpperCase()}... 🔄`)
            }, { quoted: m });

            // Perform translation
            const result = await translate(text, { to: lang });
            
            // Language names for display
            const languageNames = {
                'id': 'Indonesian', 'en': 'English', 'ja': 'Japanese', 'fr': 'French',
                'es': 'Spanish', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
                'ru': 'Russian', 'zh': 'Chinese', 'ko': 'Korean', 'ar': 'Arabic',
                'hi': 'Hindi', 'tr': 'Turkish', 'nl': 'Dutch', 'sv': 'Swedish',
                'pl': 'Polish', 'th': 'Thai', 'vi': 'Vietnamese'
            };

            // Safely get source language - handle different response structures
            let fromLang = 'Auto';
            if (result.from && result.from.language && result.from.language.iso) {
                fromLang = languageNames[result.from.language.iso] || result.from.language.iso.toUpperCase();
            } else if (result.raw && result.raw.src) {
                fromLang = languageNames[result.raw.src] || result.raw.src.toUpperCase();
            }

            const toLang = languageNames[lang] || lang.toUpperCase();

            // Send result
            await client.sendMessage(m.chat, {
                text: formatStylishReply(`🌐 Translation Result\n\n📥 From: ${fromLang}\n📤 To: ${toLang}\n\n📝 Original:\n${text}\n\n✅ Translated:\n${result.text}`)
            }, { quoted: m });

        } catch (error) {
            console.error('Translation error:', error);
            
            let errorMessage = 'Translation failed!';
            if (error.message.includes('Invalid target language')) {
                errorMessage = 'Invalid language code! Use: en, id, ja, fr, es, de, etc.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error! Try again.';
            } else if (error.message.includes('undefined')) {
                errorMessage = 'API response error. Try again.';
            }

            await client.sendMessage(m.chat, {
                text: formatStylishReply(`❌ ${errorMessage}\n\n💡 Usage:\n${prefix}tr id Hello world\n${prefix}tr ja How are you?\nReply to message with: ${prefix}tr en`)
            }, { quoted: m });
        }
    }
};
//dml