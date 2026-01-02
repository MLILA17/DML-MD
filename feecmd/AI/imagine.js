const fetch = require('node-fetch');

module.exports = {
    name: 'imagine',
    aliases: ['aiimage', 'dream', 'generate'],
    description: 'Generates AI images from text prompts',
    run: async (context) => {
        const { client, m, prefix, botname } = context;

        const formatStylishReply = (message) => {
            return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`;
        };

        /**
         * Extract prompt from message
         */
        const prompt = m.body.replace(new RegExp(`^${prefix}(imagine|aiimage|dream|generate)\\s*`, 'i'), '').trim();
        
        if (!prompt) {
            return client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ Yo, @${m.sender.split('@')[0]}! 😤 You forgot the prompt!\n┋❒ Example: ${prefix}imagine a cat playing football\n┋❒ Or: ${prefix}dream a fantasy landscape\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        try {
            /**
             * Send loading message
             */
            const loadingMsg = await client.sendMessage(m.chat, {
                text: formatStylishReply(`Generating AI image... 🎨\nPrompt: "${prompt}"\nThis may take a moment ⏳`)
            }, { quoted: m });

            /**
             * Call the new AI image API
             */
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://anabot.my.id/api/ai/dreamImage?prompt=${encodedPrompt}&models=Fantasy&apikey=freeApikey`;
            
            const response = await fetch(apiUrl, { 
                timeout: 60000 // 60 seconds for AI generation
            });

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
                    caption: formatStylishReply(`AI Image Generated! ✨\nPrompt: ${prompt}\nPowered by ${botname}`)
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Imagine command error:', error);
            
            // Try to delete loading message
            try {
                await client.sendMessage(m.chat, { 
                    delete: loadingMsg.key 
                });
            } catch (e) {
                // Ignore delete errors
            }

            let errorMessage = 'An unexpected error occurred';
            
            if (error.message.includes('status')) {
                errorMessage = 'AI service is not responding properly.';
            } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'AI generation timed out. Try a simpler prompt.';
            } else if (error.message.includes('AI failed')) {
                errorMessage = 'The AI could not generate an image from your prompt.';
            } else {
                errorMessage = error.message;
            }

            await client.sendMessage(m.chat, {
                text: formatStylishReply(`Image Generation Failed! 😤\nError: ${errorMessage}\n\nTips:\n• Use descriptive prompts\n• Avoid complex scenes\n• Try different keywords`)
            }, { quoted: m });
        }
    }
};