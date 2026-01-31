const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pair',
    aliases: ['code', 'session', 'qrcode'],
    description: 'Get WhatsApp pairing code',
    run: async (context) => {
        const { client, m, text, prefix } = context;

        if (!text) {
            return client.sendMessage(
                m.chat,
                { text: `Example Usage:\n${prefix}pair 255622220670` },
                { quoted: m }
            );
        }

        try {
            await client.sendMessage(
                m.chat,
                { react: { text: '⌛', key: m.key } }
            );

            // clean number
            const number = text.replace(/[^0-9]/g, '');
            const apiUrl = `https://session-idqr.onrender.com/code?number=${encodeURIComponent(number)}`;

            const response = await axios.get(apiUrl);
            if (!response.data || !response.data.code) {
                throw new Error('Invalid API response');
            }

            const pairingCode = response.data.code;

            await client.sendMessage(
                m.chat,
                { react: { text: '✅', key: m.key } }
            );

            // ===============================
            // RANDOM IMAGE (OPTIONAL)
            // ===============================
            const imagesDir = path.join(__dirname, '../Dmlimages');
            let imageBuffer;

            if (fs.existsSync(imagesDir)) {
                const images = fs.readdirSync(imagesDir).filter(f =>
                    /^menu\d+\.jpg$/i.test(f)
                );
                if (images.length > 0) {
                    const random = images[Math.floor(Math.random() * images.length)];
                    imageBuffer = fs.readFileSync(path.join(imagesDir, random));
                }
            }

            // ===============================
            // INTERACTIVE MESSAGE (CTA_COPY + CTA_URL)
            // ===============================
            await client.sendMessage(
                m.chat,
                {
                    ...(imageBuffer ? { image: imageBuffer } : {}),
                    interactiveMessage: {
                        header: '🔐 DML-MD PAIRING CODE',
                        title: `Your Pairing Code:\n\n${pairingCode}\n\nTap the button below to copy`,
                        footer: '> ©POWERED BY DML-MD',
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: ' Copy Code',
                                    id: 'copy_pair_code',
                                    copy_code: pairingCode
                                })
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '⭐ GitHub Repo',
                                    url: 'https://github.com/MLILA17/DML-MD'
                                })
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📢 View Channel',
                                    url: 'https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H'
                                })
                            }
                        ]
                    }
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('PAIR ERROR:', error);

            await client.sendMessage(
                m.chat,
                { react: { text: '❌', key: m.key } }
            );

            await client.sendMessage(
                m.chat,
                { text: '❌ Failed to generate pairing code. Try again later.' },
                { quoted: m }
            );
        }
    }
};
