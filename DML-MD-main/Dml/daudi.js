const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const speed = require("performance-now");
const { smsg, formatp, tanggal, formatDate, getTime, sleep, clockString, fetchJson, getBuffer, jsonformat, generateProfilePicture, parseMention, getRandom, fetchBuffer } = require('../lib/botFunctions.js');
const { exec, spawn, execSync } = require("child_process");
const { TelegraPh, UploadFileUgu } = require("../lib/toUrl");
const uploadtoimgur = require('../lib/Imgur');
const { commands, aliases, totalCommands } = require('../Handler/commandHandler');
const status_saver = require('../Functions/status_saver');
const gcPresence = require('../Functions/gcPresence');
const antitaggc = require('../Functions/antitag');
const antilink = require('../Functions/antilink');
const chatbotpm = require('../Functions/chatbotpm');
const { getSettings, getSudoUsers, getBannedUsers, getGroupSettings, updateSetting } = require('../Database/config');
const { botname, mycode } = require('../Env/settings');
const { cleanupOldMessages } = require('../lib/Store');
const antistatusmention = require('../Functions/antistatusmention');

const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

process.setMaxListeners(0);
cleanupOldMessages();
setInterval(() => cleanupOldMessages(), 24 * 60 * 60 * 1000);

function shouldStoreMessage(m) {
    const remoteJid = m.chat || m.key?.remoteJid;
    if (!remoteJid) return false;
    const isStatus = remoteJid === 'status@broadcast';
    const isBroadcast = remoteJid.includes('@broadcast');
    const isNewsletter = remoteJid.includes('@newsletter');
    return !isStatus && !isBroadcast && !isNewsletter;
}

function normalizeJidForStorage(jid) {
    if (!jid) return jid;
    if (jid.includes('@lid')) {
        return jid.split('@')[0] + '@s.whatsapp.net';
    }
    return jid;
}

function getMessageType(message) {
    if (message.conversation) return '📝 Text';
    if (message.imageMessage) return '🖼️ Image';
    if (message.videoMessage) return '🎥 Video';
    if (message.audioMessage) return '🔊 Audio';
    if (message.stickerMessage) return '😀 Sticker';
    if (message.documentMessage) return '📄 Document';
    if (message.contactMessage) return '👤 Contact';
    if (message.locationMessage) return '📍 Location';
    if (message.extendedTextMessage?.text) return '📝 Extended Text';
    if (message.buttonsResponseMessage) return '🔘 Button Response';
    if (message.listResponseMessage) return '📋 List Response';
    if (message.templateButtonReplyMessage) return '🎨 Template Button';
    return '❓ Unknown';
}

module.exports = toxic = async (client, m, chatUpdate, store) => {
    try {
        const sudoUsers = await getSudoUsers();
        const bannedUsers = await getBannedUsers();
        let settings = await getSettings();
        if (!settings) {
            console.error("DML-MD: Settings not found, cannot proceed!");
            return;
        }

        const { prefix, mode, gcpresence, antitag, antidelete: antideleteSetting, antilink: antilinkSetting, chatbotpm: chatbotpmSetting, packname } = settings;

        var body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            m.message?.documentMessage?.caption ||
            m.message?.buttonsResponseMessage?.selectedButtonId ||
            m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m.message?.templateButtonReplyMessage?.selectedId ||
            m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
            m.text ||
            "";

        body = typeof body === 'string' ? body : '';

        if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                body = params.id || body;
            } catch (e) {}
        }

        if (m.message?.templateButtonReplyMessage?.selectedId) {
            body = m.message.templateButtonReplyMessage.selectedId;
        }

        const Tag = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        var msgToxic = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        var budy = typeof m.text == "string" ? m.text : "";

        const timestamp = speed();
        const toxicspeed = speed() - timestamp;
        const filePath = require('path').resolve(__dirname, '../dml.jpg');
        const pict = fs.readFileSync(filePath);

        const commandName = body && (body.startsWith(prefix) || body.startsWith('/'))
            ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()
            : null;
        const resolvedCommandName = aliases[commandName] || commandName;
        const cmd = commands[resolvedCommandName];

        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const botNumber = await client.decodeJid(client.user.id);
        const itsMe = m.sender == botNumber;
        let text = (q = args.join(" "));
        const arg = budy.trim().substring(budy.indexOf(" ") + 1);
        const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

        try {
            m.isGroup = m.chat.endsWith("g.us");
            m.metadata = m.isGroup ? await client.groupMetadata(m.chat).catch(e => {}) : {};
            const participants = m.metadata?.participants || [];
            m.isAdmin = Boolean(participants.find(p => p.admin !== null && p.jid === m.sender));
            m.isBotAdmin = Boolean(participants.find(p => p.admin !== null && p.jid === botNumber));
        } catch (error) {
            m.metadata = {};
            m.isAdmin = false;
            m.isBotAdmin = false;
        }

        const clint = (m.quoted || m);
        const quoted = (clint.mtype == 'buttonsMessage')
            ? clint[Object.keys(clint)[1]]
            : (clint.mtype == 'templateMessage')
                ? clint.hydratedTemplate[Object.keys(clint.hydratedTemplate)[1]]
                : (clint.mtype == 'product')
                    ? clint[Object.keys(clint)[0]]
                    : m.quoted
                        ? m.quoted
                        : m;

        const mime = (quoted.msg || quoted).mimetype || "";
        const qmsg = (quoted.msg || quoted);
        const DevToxic = Array.isArray(sudoUsers) ? sudoUsers : [];
        const Owner = DevToxic.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender);

        const groupMetadata = m.isGroup ? m.metadata : "";
        const participants = m.isGroup && groupMetadata ? groupMetadata.participants : "";
        const isBotAdmin = m.isBotAdmin;
        const isAdmin = m.isAdmin;
        const IsGroup = m.isGroup;

        const fakeQuoted = {
            key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net', id: m.id },
            message: { conversation: "Verified" },
            contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
        };

        const context = {
            client, m, text, Owner, chatUpdate, store, isBotAdmin, isAdmin, IsGroup, participants,
            pushname, body, budy, totalCommands, args, mime, qmsg, msgToxic, botNumber, itsMe,
            packname, generateProfilePicture, groupMetadata, toxicspeed, mycode, fetchJson, exec,
            getRandom, UploadFileUgu, TelegraPh, prefix, cmd, botname, mode, gcpresence, antitag,
            antidelete: antideleteSetting, fetchBuffer, store, uploadtoimgur, chatUpdate,
            getGroupAdmins: () => participants.filter(p => p.admin !== null).map(p => p.jid), pict, Tag
        };

        const bannedMessages = [
            "You Have been banned for calling without permission ⚠️!",
            "You Have been banned for calling without permission ⚠️"
        ];

        const trimmedBody = body.trim();
        if ((trimmedBody.startsWith('>') || trimmedBody.startsWith('$')) && Owner) {
            const evalText = trimmedBody.slice(1).trim();
            if (bannedMessages.some(msg => evalText.includes(msg))) {
                return;
            }
            try {
                await ownerMiddleware(context, async () => {
                    if (!evalText) return m.reply("W eval?🟢!");
                    try {
                        let evaled = await eval(evalText);
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) {
                        await m.reply("Error during eval execution:\n" + String(err));
                    }
                });
                return;
            } catch (e) {}
        }

        if (cmd) {
            const senderNumber = m.sender.replace(/@s\.whatsapp\.net$/, '');
            if (bannedUsers.includes(senderNumber)) {
                await client.sendMessage(m.chat, {
                    text: 'You Have been banned for calling without permission ⚠️!',
                }, { quoted: fakeQuoted });
                return;
            }
        }

        if (cmd && mode === 'private' && !itsMe && !Owner && !sudoUsers.includes(m.sender)) return;

        if (store && shouldStoreMessage(m)) {
            const remoteJid = m.chat || m.key?.remoteJid;
            const normalizedJid = normalizeJidForStorage(remoteJid);
            if (normalizedJid) {
                if (!store.chats) store.chats = Object.create(null);
                if (!store.messageMap) store.messageMap = Object.create(null);
                if (!store.chats[normalizedJid]) {
                    store.chats[normalizedJid] = [];
                }
                const messageId = m.key.id;
                const messageWithTimestamp = {
                    ...m,
                    timestamp: Date.now(),
                    originalRemoteJid: remoteJid,
                    normalizedRemoteJid: normalizedJid
                };
                store.chats[normalizedJid].push(messageWithTimestamp);
                store.messageMap[messageId] = {
                    normalizedJid: normalizedJid,
                    originalJid: remoteJid,
                    timestamp: Date.now()
                };
                if (store.chats[normalizedJid].length > 100) {
                    const removedMsg = store.chats[normalizedJid].shift();
                    if (removedMsg?.key?.id) {
                        delete store.messageMap[removedMsg.key.id];
                    }
                }
            }
        }

        if (m.message?.protocolMessage?.type === 0) {
            const currentSettings = await getSettings();
            const isAntideleteEnabled = currentSettings?.antidelete === true;
            if (isAntideleteEnabled && store?.chats && store?.messageMap) {
                const deletedKey = m.message.protocolMessage.key;
                const deletedMessageId = deletedKey.id;
                const deletedRemoteJid = deletedKey.remoteJid;
                const normalizedDeletedJid = normalizeJidForStorage(deletedRemoteJid);
                const isDeletedFromStatus = deletedRemoteJid === 'status@broadcast' || deletedRemoteJid.includes('@broadcast');
                const isDeletedFromNewsletter = deletedRemoteJid.includes('@newsletter');
                if (isDeletedFromStatus || isDeletedFromNewsletter) {
                    return;
                }
                let deletedMessage = null;
                let chatJidToSearch = null;
                if (store.messageMap[deletedMessageId]) {
                    chatJidToSearch = store.messageMap[deletedMessageId].normalizedJid;
                } else {
                    chatJidToSearch = normalizedDeletedJid;
                }
                if (store.chats[chatJidToSearch]) {
                    const chatMessages = store.chats[chatJidToSearch];
                    deletedMessage = chatMessages.find((msg) => msg.key.id === deletedMessageId);
                }
                if (!deletedMessage && normalizedDeletedJid !== chatJidToSearch) {
                    if (store.chats[deletedRemoteJid]) {
                        const chatMessages = store.chats[deletedRemoteJid];
                        deletedMessage = chatMessages.find((msg) => msg.key.id === deletedMessageId);
                    }
                }
                if (!deletedMessage) {
                    for (const [jid, messages] of Object.entries(store.chats)) {
                        if (['key', 'idGetter', 'dict', 'array'].includes(jid)) continue;
                        const foundMsg = messages.find(msg => msg.key.id === deletedMessageId);
                        if (foundMsg) {
                            deletedMessage = foundMsg;
                            chatJidToSearch = jid;
                            break;
                        }
                    }
                }
                if (deletedMessage) {
                    const botJid = client.decodeJid(client.user.id);
                    const sender = client.decodeJid(deletedMessage.key.participant || deletedMessage.key.remoteJid);
                    const deleter = m.key.participant ? m.key.participant.split('@')[0] : 'Unknown';
                    const groupName = chatJidToSearch.endsWith('@g.us') ? 'Group' : 'Private Chat';
                    const deleteTime = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
                    const messageType = getMessageType(deletedMessage.message);
                    try {
                        const notification = `*AntiDelete Detected*\n\n*Time:* ${deleteTime}\n*Chat:* ${groupName}\n*Message Type:* ${messageType}\n*Deleted by:* @${deleter}\n*Sender:* @${sender.split('@')[0]}`;
                        if (deletedMessage.message.conversation) {
                            await client.sendMessage(botJid, {
                                text: `${notification}\n\n📝 *Deleted Message:*\n${deletedMessage.message.conversation}`,
                                mentions: [sender]
                            });
                        }
                        else if (deletedMessage.message.imageMessage) {
                            const caption = deletedMessage.message.imageMessage.caption || '';
                            const imageBuffer = await client.downloadMediaMessage(deletedMessage.message.imageMessage);
                            await client.sendMessage(botJid, {
                                image: imageBuffer,
                                caption: `${notification}\n${caption}`,
                                mentions: [sender]
                            });
                        }
                        else if (deletedMessage.message.videoMessage) {
                            const caption = deletedMessage.message.videoMessage.caption || '';
                            const videoBuffer = await client.downloadMediaMessage(deletedMessage.message.videoMessage);
                            await client.sendMessage(botJid, {
                                video: videoBuffer,
                                caption: `${notification}\n${caption}`,
                                mentions: [sender]
                            });
                        }
                        else if (deletedMessage.message.audioMessage) {
                            const audioBuffer = await client.downloadMediaMessage(deletedMessage.message.audioMessage);
                            await client.sendMessage(botJid, {
                                audio: audioBuffer,
                                ptt: true,
                                caption: notification,
                                mentions: [sender]
                            });
                        }
                        else if (deletedMessage.message.stickerMessage) {
                            const stickerBuffer = await client.downloadMediaMessage(deletedMessage.message.stickerMessage);
                            await client.sendMessage(botJid, {
                                sticker: stickerBuffer,
                                caption: notification,
                                mentions: [sender]
                            });
                        }
                        else if (deletedMessage.message.extendedTextMessage?.text) {
                            await client.sendMessage(botJid, {
                                text: `${notification}\n\n📝 *Deleted Message:*\n${deletedMessage.message.extendedTextMessage.text}`,
                                mentions: [sender]
                            });
                        } else {
                            await client.sendMessage(botJid, {
                                text: `${notification}\n\n⚠️ *Message type cannot be recovered*`,
                                mentions: [sender]
                            });
                        }
                    } catch (error) {}
                }
            }
        }

        await antilink(client, m, store);
await chatbotpm(client, m, store, chatbotpmSetting);
await status_saver(client, m, Owner, prefix);
await gcPresence(client, m);
await antitaggc(client, m, isBotAdmin, itsMe, isAdmin, Owner, body);

const exemptGroup = "120363156185607326@g.us";
if (m.chat !== exemptGroup) {
    await antistatusmention(client, m);
}

if (cmd) {
    await commands[resolvedCommandName](context);
}

    } catch (err) {}

    process.on('uncaughtException', function (err) {
        let e = String(err);
        if (e.includes("conflict")) return;
        if (e.includes("not-authorized")) return;
        if (e.includes("Socket connection timeout")) return;
        if (e.includes("rate-overlimit")) return;
        if (e.includes("Connection Closed")) return;
        if (e.includes("Timed Out")) return;
        if (e.includes("Value not found")) return;
    });
};
