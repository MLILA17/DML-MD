const fetch = require('node-fetch');

module.exports = {
    name: 'imagine',
    aliases: ['aiimage', 'dream', 'generate'],
    description: 'Generates AI images from text prompts',
    run: async (context) => {
        const { client, m, prefix, botname } = context;

        // 🌈 New modern for dml bot
        const formatStylishReply = (message) => {
            return `┏━━━〔 🤖 AI IMAGE 〕━━━┓
┃ ${message}
┗━━━━━━━━━━━━━━━━━━━━┛`;
        };

        /**
         * Extract prompt from message
         */
        const prompt = m.body
            .replace(new RegExp(`^${prefix}(imagine|aiimage|dream|generate)\\s*`, 'i'), '')
            .trim();
        
        if (!prompt) {
            return client.sendMessage(
                m.chat,
                {
                    text: `┏━━━〔 ⚠️ MISSING PROMPT 〕━━━┓
┃ Hey @${m.sender.split('@')[0]} 👀
┃ You forgot to add a prompt!
┃ 
┃ 📌 Example:
┃ ${prefix}imagine a cat playing football
┃ ${prefix}dream a fantasy landscape
┗━━━━━━━━━━━━━━━━━━━━┛`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        let loadingMsg;

        try {
            /**
             * Send loading message
             */
            loadingMsg = await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `🎨 Creating your AI image...
🔹 Prompt: "${prompt}"
⏳ Please wait a moment`
                    )
                },
                { quoted: m }
            );

            /**
             * Call the AI image API
             */
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://anabot.my.id/api/ai/dreamImage?prompt=${encodedPrompt}&models=Fantasy&apikey=freeApikey`;
            
            const response = await fetch(apiUrl, { timeout: 60000 });

            if (!response.ok) {
                throw new Error(`API returned status: ${response.status}`);
            }

            const data = await response.json();

            /**
             * Validate API response
             */
            if (!data.success || !data.data?.result) {
                throw new Error('AI failed to generate image');
            }

            const imageUrl = data.data.result;

            // Delete loading message
            await client.sendMessage(m.chat, {
                delete: loadingMsg.key
            });

            /**
             * Send the generated image
             */
            await client.sendMessage(
                m.chat,
                {
                    image: { url: imageUrl },
                    caption: formatStylishReply(
                        `✨ Image Generated Successfully!
🖼 Prompt: ${prompt}

🚀 Powered by ${botname}`
                    )
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Imagine command error:', error);

            try {
                if (loadingMsg) {
                    await client.sendMessage(m.chat, {
                        delete: loadingMsg.key
                    });
                }
            } catch {}

            let errorMessage = 'Something went wrong';

            if (error.message.includes('status')) {
                errorMessage = 'AI service is currently unavailable.';
            } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                errorMessage = 'Network error detected.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Try a simpler prompt.';
            } else if (error.message.includes('AI failed')) {
                errorMessage = 'AI could not understand your prompt.';
            } else {
                errorMessage = error.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `❌ Image Generation Failed
⚠️ Reason: ${errorMessage}

💡 Tips:
• Be clear and descriptive
• Avoid very long prompts
• Try different keywords`
                    )
                },
                { quoted: m }
            );
        }
    }
};
// DML
