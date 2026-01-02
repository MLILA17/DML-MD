const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../message_data');

// Create base directory if it doesn't exist
if (!fs.existsSync(baseDir)) {
    try {
        fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {
        console.error('🄵🄴🄴-🅇🄼🄳 Store Error: Failed to create /app/message_data directory:', e);
    }
}

function loadChatData(remoteJid, messageId) {
    const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
    try {
        const data = fs.readFileSync(chatFilePath, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        return [];
    }
}

function saveChatData(remoteJid, messageId, chatData) {
    const chatDir = path.join(baseDir, remoteJid);

    if (!fs.existsSync(chatDir)) {
        try {
            fs.mkdirSync(chatDir, { recursive: true });
        } catch (e) {
            console.error('🄵🄴🄴-🅇🄼🄳 Store Error: Failed to create directory:', e);
        }
    }

    const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);

    try {
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
    } catch (error) {
        console.error('🄵🄴🄴-🅇🄼🄳 Store Error: Failed to save chat data:', error);
    }
}

/**
 * Cleanup old message files (default: older than 24 hours)
 */
function cleanupOldMessages(maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
        const now = Date.now();

        // Walk through each remoteJid folder
        fs.readdirSync(baseDir).forEach(remoteJid => {
            const chatDir = path.join(baseDir, remoteJid);

            if (!fs.lstatSync(chatDir).isDirectory()) return;

            fs.readdirSync(chatDir).forEach(file => {
                const filePath = path.join(chatDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtimeMs > maxAgeMs) {
                        fs.unlinkSync(filePath);
                        // console.log(`Toxic-MD Store Cleanup: Deleted old file ${filePath}`);
                    }
                } catch (err) {
                    console.error('🄵🄴🄴-🅇🄼🄳 Store Cleanup Error:', err);
                }
            });

            // If folder is empty after cleanup, remove it
            if (fs.readdirSync(chatDir).length === 0) {
                fs.rmdirSync(chatDir, { recursive: true });
            }
        });
    } catch (err) {
        console.error('🄵🄴🄴-🅇🄼🄳 Store Cleanup Fatal Error:', err);
    }
}

module.exports = { loadChatData, saveChatData, cleanupOldMessages };