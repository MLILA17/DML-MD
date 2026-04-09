const {
  default: DmlConnect,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers,
  generateWAMessageContent,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const FileType = require("file-type");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep } = require('./lib/botFunctions');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const authenticationn = require('./auth/auth.js');
require('./features/cleanup');
const { smsg } = require('./handlers/smsg');
const { getSettings, getBannedUsers, banUser } = require("./database/config");
let _idxSettingsCache = null, _idxSettingsCacheTime = 0;
const IDX_CACHE_TTL = 20000;
async function getCachedSettings() {
  const now = Date.now();
  if (_idxSettingsCache && (now - _idxSettingsCacheTime) < IDX_CACHE_TTL) return _idxSettingsCache;
  try { _idxSettingsCache = await getSettings(); _idxSettingsCacheTime = Date.now(); } catch {}
  return _idxSettingsCache;
}
const { botname } = require('./config/settings');
const { DateTime } = require('luxon');
const { commands, totalCommands } = require('./handlers/commandHandler');
const path = require('path');

const sessionName = path.join(__dirname, 'Session');

if (!fs.existsSync(sessionName)) {
  fs.mkdirSync(sessionName, { recursive: true });
}

const groupEvents = require("./handlers/eventHandler");
const connectionHandler = require('./handlers/connectionHandler');

const CHANNEL_JID = '120363322461279856@newsletter';
const CHANNEL_EMOJIS = ['❤️', '🔥', '👍🏻', '✨', '🌚', '🗿', '😮'];

process.on("unhandledRejection", (reason) => {
  console.error('❌ [UNHANDLED ERROR] Unhandled Rejection:', reason);
});

process.on("uncaughtException", (error) => {
  console.error('❌ [UNCAUGHT ERROR]:', error);
});

function invalidateSettingsCache() {
  const { db } = require('./database/config');
  try { db.prepare('SELECT 1').get(); } catch (e) {}
}

function cleanupSessionFiles() {
  try {
    if (!fs.existsSync(sessionName)) return;
    const files = fs.readdirSync(sessionName);
    const keepFiles = ['creds.json', 'app-state-sync-version.json', 'pre-key-', 'session-', 'sender-key-', 'app-state-sync-key-'];
    files.forEach(file => {
      const filePath = path.join(sessionName, file);
      try {
        const stats = fs.statSync(filePath);
        const shouldKeep = keepFiles.some(pattern => pattern.endsWith('-') ? file.startsWith(pattern) : file === pattern);
        if (!shouldKeep) {
          const hoursOld = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
          if (hoursOld > 24) fs.unlinkSync(filePath);
        }
      } catch (fileError) {}
    });
  } catch (error) {}
}

async function handleAutoViewStatus(sock, m) {
  if (!sock?.sessionConfig?.autoViewStatus) return;
  if (!m?.key) return;
  if (m.key.remoteJid !== 'status@broadcast') return;
  const isLid = m.key.addressingMode === 'lid';
  const resolvedKey = isLid ? { ...m.key, participant: m.key.remoteJidAlt || m.key.participant } : m.key;
  try { await sock.readMessages([resolvedKey]); } catch (err) {}
}

function resolveStatusPosterJid(key = {}) {
  const rawParticipant = key.remoteJidAlt || key.participant || '';
  if (!rawParticipant) return '';
  const decoded = rawParticipant.split('@');
  const user = (decoded[0] || '').split(':')[0];
  const server = decoded[1] || '';
  if (!user) return '';
  if (server === 'lid') return user + '@s.whatsapp.net';
  return user + '@' + server;
}

let cleanupInterval = null;
let autobioInterval = null;
let storeWriteInterval = null;
let memoryCheckInterval = null;
let processedCallsInterval = null;

if (global._DmlCurrentClient === undefined) global._DmlCurrentClient = null;
if (global._DmlIsStarting === undefined) global._DmlIsStarting = false;
if (global._DmlReconnectTimer === undefined) global._DmlReconnectTimer = null;
if (global._DmlShuttingDown === undefined) global._DmlShuttingDown = false;

async function startDml() {
  if (global._DmlIsStarting) return;
  global._DmlIsStarting = true;

  try {
    if (!fs.existsSync(sessionName)) fs.mkdirSync(sessionName, { recursive: true });

    await authenticationn();

    if (global._DmlReconnectTimer) {
      clearTimeout(global._DmlReconnectTimer);
      global._DmlReconnectTimer = null;
    }

    if (cleanupInterval) clearInterval(cleanupInterval);
    if (memoryCheckInterval) clearInterval(memoryCheckInterval);
    if (autobioInterval) clearInterval(autobioInterval);
    if (storeWriteInterval) clearInterval(storeWriteInterval);
    if (processedCallsInterval) clearInterval(processedCallsInterval);

    cleanupInterval = setInterval(cleanupSessionFiles, 24 * 60 * 60 * 1000);
    cleanupSessionFiles();

    memoryCheckInterval = setInterval(() => {
      try {
        const usedMB = Math.round(process.memoryUsage().rss / 1024 / 1024);
        if (usedMB > 450) { console.log(`⚠️ High memory: ${usedMB}MB`); if (global.gc) global.gc(); }
      } catch (e) {}
    }, 5 * 60 * 1000);

    if (global._DmlCurrentClient) {
      try {
        global._DmlShuttingDown = true;
        global._DmlCurrentClient.ev.removeAllListeners();
        global._DmlCurrentClient.ws.removeAllListeners();
        try { global._DmlCurrentClient.end(new Error("Restarting client")); } catch (e) {}
        try { global._DmlCurrentClient.ws.close(); } catch (e) {}
      } catch (e) {} finally {
        global._DmlCurrentClient = null;
        global._DmlShuttingDown = false;
      }
    }

    let settingss = await getCachedSettings();
    if (!settingss) {
      console.log('❌ Dml-MD FAILED TO CONNECT - Settings not found');
      global._DmlIsStarting = false;
      return;
    }

    const { autobio } = settingss;
    const version = (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/Dml/Defaults/baileys-version.json')).json()).version;
    const { saveCreds, state } = await useMultiFileAuthState(sessionName);

    const client = DmlConnect({
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: !(settingss.presence === 'offline' || settingss.presence === 'unavailable'),
      connectTimeoutMs: 60000,
      userDevicesCache: new Map(),
      defaultQueryTimeoutMs: undefined,
      keepAliveIntervalMs: 25000,
      generateHighQualityLinkPreview: true,
      emitOwnEvents: true,
      fireInitQueries: true,
      retryRequestDelayMs: 3000,
      getMessage: async (key) => {
        const msg = store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      },
      transactionOpts: { maxCommitRetries: 3, delayBetweenTriesMs: 500 },
      patchMessageBeforeSending: (message) => {
        try {
          if (!message || typeof message !== 'object') return message;
          const hasLegacyInteractive = !!message.buttonsMessage || !!message.templateMessage || !!message.listMessage;
          if (!hasLegacyInteractive) return message;
          if (message.viewOnceMessage || message.ephemeralMessage) return message;
          return { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} }, ...message } } };
        } catch (error) { return message; }
      },
      version,
      browser: Browsers.macOS("Chrome"),
      logger: pino({ level: 'silent' }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent", stream: 'store' }))
      }
    });

    client.sessionConfig = { autoViewStatus: settingss?.autoview === true || settingss?.autoview === 'true' };
    global._DmlCurrentClient = client;
    store.bind(client.ev);

    if (!client.pinMessage) {
      client.pinMessage = async (jid, messageKey, type) => {
        const { jidNormalizedUser } = require('@whiskeysockets/baileys');
        const pinType = type === undefined ? 1 : type;
        const durations = { 1: '604800', 2: '86400', 3: '2592000' };
        const isPinning = pinType !== 0;
        const duration = durations[pinType] || '604800';
        const tag = isPinning ? 'add' : 'remove';
        const msgId = (typeof messageKey === 'string') ? messageKey : (messageKey.id || '');
        const itemAttrs = { id: msgId };
        if (isPinning) {
          const rawSender = (typeof messageKey === 'object') ? (messageKey.participant || (messageKey.fromMe ? (client.user?.id || jid) : messageKey.remoteJid)) : jid;
          itemAttrs.sender = jidNormalizedUser(rawSender || jid);
          itemAttrs.type = duration;
        }
        await client.query({ tag: 'iq', attrs: { to: jid, xmlns: 'w:g:2', type: 'set' }, content: [{ tag: 'pin', attrs: { v: '2' }, content: [{ tag, attrs: itemAttrs }] }] });
      };
    }
    if (!client.clearChatMessages) client.clearChatMessages = (jid, lastMsg) => client.chatModify({ clearChat: { lastMsg: lastMsg || {} } }, jid);
    if (!client.updateCallPrivacy) {
      client.updateCallPrivacy = async (value) => {
        const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
        await client.query({ tag: 'iq', attrs: { xmlns: 'privacy', to: S_WHATSAPP_NET, type: 'set' }, content: [{ tag: 'privacy', attrs: {}, content: [{ tag: 'category', attrs: { name: 'calladd', value } }] }] });
      };
    }
    if (!client.updateMessagesPrivacy) {
      client.updateMessagesPrivacy = async (value) => {
        const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
        await client.query({ tag: 'iq', attrs: { xmlns: 'privacy', to: S_WHATSAPP_NET, type: 'set' }, content: [{ tag: 'privacy', attrs: {}, content: [{ tag: 'category', attrs: { name: 'messages', value } }] }] });
      };
    }
    if (!client.updateDisableLinkPreviewsPrivacy) client.updateDisableLinkPreviewsPrivacy = (isPreviewsDisabled) => client.chatModify({ disableLinkPreviews: { isPreviewsDisabled } }, '');
    if (!client.addOrEditContact) client.addOrEditContact = (jid, contact) => client.chatModify({ contact }, jid);
    if (!client.removeContact) client.removeContact = (jid) => client.chatModify({ contact: null }, jid);
    if (!client.addLabel) client.addLabel = (jid, labels) => client.chatModify({ addLabel: { ...labels } }, jid);

    client.ev.on("creds.update", saveCreds);

    storeWriteInterval = setInterval(() => { try { store.writeToFile("store.json"); } catch (e) {} }, 300000);

      // ── DML AUTOBIO  ──
  if (autobio) {
    const themes = [
     // Hustle mood
(d, t) => `⚡ ${botname}\n𝗜 𝗗𝗼𝗻'𝘁 𝗦𝗹𝗲𝗲𝗽, 𝗜 𝗚𝗿𝗶𝗻𝗱 • ${d} ${t}`,
// Lowkey cool
(d, t) => `🌙 ${botname}\n𝗤𝘂𝗶𝗲𝘁 𝗕𝘂𝘁 𝗔𝗹𝘄𝗮𝘆𝘀 𝗛𝗲𝗿𝗲 • ${d} ${t}`,
// Boss energy
(d, t) => `👑 ${botname}\n𝗕𝗼𝘀𝘀 𝗠𝗼𝗱𝗲 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱 🔛 ${d} ${t}`,
// Swahili drip
(d, t) => `🔥 ${botname}\n𝗪𝗮𝘁𝘂 𝗡𝗶 𝗠𝘁𝗮𝗷𝗶 𝗧𝗼𝘀𝗵𝗮 • 𝗧𝗮𝗻𝘇𝗮𝗻𝗶𝗮 ${d} ${t}`,
// Galaxy vibe
(d, t) => `🌌 ${botname}\n𝗢𝘂𝘁 𝗢𝗳 𝗧𝗵𝗶𝘀 𝗪𝗼𝗿𝗹𝗱 🚀 ${d} ${t}`,
// Unbothered
(d, t) => `😎 ${botname}\n𝗨𝗻𝗯𝗼𝘁𝗵𝗲𝗿𝗲𝗱 & 𝗢𝗻𝗹𝗶𝗻𝗲 • ${d} ${t}`,
// Late night feel
(d, t) => `🌃 ${botname}\n𝗨𝗽 𝗪𝗵𝗲𝗻 𝗧𝗵𝗲 𝗪𝗼𝗿𝗹𝗱 𝗦𝗹𝗲𝗲𝗽𝘀 • ${d} ${t}`,
// Ice cold
(d, t) => `🧊 ${botname}\n𝗖𝗼𝗼𝗹, 𝗖𝗮𝗹𝗺 & 𝗔𝗹𝘄𝗮𝘆𝘀 𝗢𝗻 • ${d} ${t}`,
// No cap
(d, t) => `💯 ${botname}\n𝗡𝗼 𝗖𝗮𝗽, 𝗜'𝗺 𝗔𝗹𝘄𝗮𝘆𝘀 𝗢𝗻𝗹𝗶𝗻𝗲 • ${d} ${t}`,
// Tanzanian pride
(d, t) => `🇹🇿 ${botname}\n𝗧𝗮𝗻𝘇𝗮𝗻𝗶𝗮'𝘀 𝗙𝗶𝗻𝗲𝘀𝘁 𝗕𝗼𝘁 • ${d} ${t}`,
// Motivation 1 — Keep going
(d, t) => `💪 ${botname}\n𝗙𝗮𝗹𝗹 𝟳 𝗧𝗶𝗺𝗲𝘀, 𝗥𝗶𝘀𝗲 𝟴 • ${d} ${t}`,
// Motivation 2 — Dream big
(d, t) => `🌠 ${botname}\n𝗗𝗿𝗲𝗮𝗺 𝗕𝗶𝗴, 𝗪𝗼𝗿𝗸 𝗛𝗮𝗿𝗱, 𝗦𝘁𝗮𝘆 𝗛𝘂𝗺𝗯𝗹𝗲 • ${d} ${t}`,
// Motivation 3 — Progress
(d, t) => `🎯 ${botname}\n𝗦𝗺𝗮𝗹𝗹 𝗦𝘁𝗲𝗽𝘀 𝗦𝘁𝗶𝗹𝗹 𝗠𝗼𝘃𝗲 𝗬𝗼𝘂 𝗙𝗼𝗿𝘄𝗮𝗿𝗱 • ${d} ${t}`,
// Motivation 4 — Believe
(d, t) => `✨ ${botname}\n𝗕𝗲𝗹𝗶𝗲𝘃𝗲 𝗜𝘁, 𝗕𝘂𝗶𝗹𝗱 𝗜𝘁, 𝗕𝗲𝗰𝗼𝗺𝗲 𝗜𝘁 • ${d} ${t}`,
// Motivation 5 — Never quit
(d, t) => `🔥 ${botname}\n𝗣𝗮𝗶𝗻 𝗜𝘀 𝗧𝗲𝗺𝗽𝗼𝗿𝗮𝗿𝘆, 𝗚𝗿𝗲𝗮𝘁𝗻𝗲𝘀𝘀 𝗜𝘀 𝗙𝗼𝗿𝗲𝘃𝗲𝗿 • ${d} ${t}`,
// Road to success — Always under construction
(d, t) => `🚧 ${botname}\n𝗧𝗵𝗲 𝗥𝗼𝗮𝗱 𝗧𝗼 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 𝗜𝘀 𝗔𝗹𝘄𝗮𝘆𝘀 𝗨𝗻𝗱𝗲𝗿 𝗖𝗼𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻 • ${d} ${t}`,
(d, t) => `🛠️ ${botname}\n𝗘𝘃𝗲𝗿𝘆 𝗗𝗮𝘆 𝗜 𝗣𝗮𝘃𝗲 𝗠𝘆 𝗪𝗮𝘆 𝗧𝗼 𝗚𝗿𝗲𝗮𝘁𝗻𝗲𝘀𝘀 • ${d} ${t}`,
(d, t) => `🔨 ${botname}\n𝗚𝗿𝗼𝘄𝘁𝗵 𝗜𝘀 𝗔 𝗖𝗼𝗻𝘀𝘁𝗮𝗻𝘁 𝗪𝗼𝗿𝗸𝗶𝗻𝗴 𝗦𝗶𝘁𝗲 • ${d} ${t}`,
(d, t) => `🏗️ ${botname}\n𝗕𝘂𝗶𝗹𝗱𝗶𝗻𝗴 𝗠𝘆 𝗗𝗿𝗲𝗮𝗺𝘀 𝗕𝗿𝗶𝗰𝗸 𝗕𝘆 𝗕𝗿𝗶𝗰𝗸 • ${d} ${t}`,
(d, t) => `🚀 ${botname}\n𝗧𝗵𝗲 𝗝𝗼𝘂𝗿𝗻𝗲𝘆 𝗜𝘀 𝗡𝗲𝘃𝗲𝗿 𝗙𝗶𝗻𝗶𝘀𝗵𝗲𝗱, 𝗔𝗻𝗱 𝗧𝗵𝗮𝘁'𝘀 𝗧𝗵𝗲 𝗕𝗲𝗮𝘂𝘁𝘆 • ${d} ${t}`,
  ];

    let i = 0;
    setInterval(async () => {
      try {
        const now = new Date();
        const d = now.toLocaleString('en-US', { weekday: 'short', timeZone: 'Africa/Nairobi' });
        const t = now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' });
        await client.updateProfileStatus(themes[i % themes.length](d, t));
        i++;
      } catch (e) {
        console.error('[AUTOBIO]', e.message);
      }
    }, 10 * 1000);
  }

    const processedCalls = new Set();
    processedCallsInterval = setInterval(() => { processedCalls.clear(); }, 10 * 60 * 1000);

    client.ws.on('CB:call', async (json) => {
      try {
        const settingszs = await getCachedSettings();
        if (!settingszs?.anticall) return;
        const callId = json.content?.[0]?.attrs?.['call-id'];
        const callerJid = json.content?.[0]?.attrs?.['call-creator'];
        if (!callId || !callerJid) return;
        if (callerJid.endsWith('@g.us')) return;
        const callerNumber = callerJid.replace(/[@.a-z]/g, "");
        if (processedCalls.has(callId)) return;
        processedCalls.add(callId);
        const fakeQuoted = { key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net', id: callId }, message: { conversation: "Verified" }, contextInfo: { mentionedJid: [callerJid], forwardingScore: 999, isForwarded: true } };
        await client.rejectCall(callId, callerJid);
        await client.sendMessage(callerJid, { text: "> Calling without permission is highly prohibited ⚠️!" }, { quoted: fakeQuoted });
        const bannedUsers = await getBannedUsers();
        if (!bannedUsers.includes(callerNumber)) await banUser(callerNumber);
      } catch (callError) {}
    });

    client.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      let settings = await getCachedSettings();
      if (!settings) return;

      client.sessionConfig.autoViewStatus = settings?.autoview === true || settings?.autoview === 'true';
      const { autoread, autolike, autoview, presence, autolikeemoji, stealth } = settings;
      const isStealthOn = stealth === 'true' || stealth === true;

      for (const mek of messages) {
        try {
          if (!mek || !mek.key) continue;
          const remoteJid = mek.key.remoteJid;

          if (remoteJid === CHANNEL_JID) {
            try {
              const messageId = mek.newsletterServerId || mek.key.id;
              if (!messageId || !client?.user?.id) continue;
              const emoji = CHANNEL_EMOJIS[Math.floor(Math.random() * CHANNEL_EMOJIS.length)];
              await new Promise(r => setTimeout(r, 3000 + Math.floor(Math.random() * 7000)));
              try {
                if (typeof client.newsletterReactMessage === 'function') {
                  await client.newsletterReactMessage(remoteJid, messageId.toString(), emoji).catch(() => {});
                } else {
                  await client.sendMessage(remoteJid, { react: { text: emoji, key: mek.key } }).catch(() => {});
                }
              } catch (e) {}
            } catch (e) {}
            continue;
          }

          if (remoteJid === "status@broadcast") {
            const isAutolike = autolike === true || autolike === 'true';
            await handleAutoViewStatus(client, mek);
            const posterJid = resolveStatusPosterJid(mek.key);
            if (isAutolike && posterJid) {
              try {
                const nickk = client.decodeJid(client.user.id);
                let reactEmoji = autolikeemoji || '❤️';
                if (reactEmoji === 'random') {
                  const emojis = ['❤️', '🩶', '🔥', '🤍', '♦️', '🎉', '💚', '💯', '✨', '☢️'];
                  reactEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                }
                const reactKey = { ...mek.key, participant: posterJid };
                await client.sendMessage(remoteJid, { react: { text: reactEmoji, key: reactKey } }, { statusJidList: [posterJid, nickk] });
              } catch (sendError) {}
            }
            continue;
          }

          if (!mek.message) continue;
          mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
          if (!mek.message) continue;
          if (isStealthOn) continue;

          if (autoread && remoteJid.endsWith('@s.whatsapp.net')) {
            client.readMessages([mek.key]).catch(() => {});
          }

          if (remoteJid.endsWith('@s.whatsapp.net')) {
            try {
              if (presence === 'online') client.sendPresenceUpdate("available", remoteJid).catch(() => {});
              else if (presence === 'typing') client.sendPresenceUpdate("composing", remoteJid).catch(() => {});
              else if (presence === 'recording') client.sendPresenceUpdate("recording", remoteJid).catch(() => {});
            } catch (error) {}
          }

          if (!client.public && !mek.key.fromMe) continue;

          if (mek.message?.listResponseMessage) {
            const selectedCmd = mek.message.listResponseMessage.singleSelectReply?.selectedRowId;
            if (selectedCmd) {
              const effectivePrefix = settings?.prefix || '.';
              let command = selectedCmd.startsWith(effectivePrefix) ? selectedCmd.slice(effectivePrefix.length).toLowerCase() : selectedCmd.toLowerCase();
              const listM = { ...mek, body: selectedCmd, text: selectedCmd, command, prefix: effectivePrefix, sender: mek.key.remoteJid, from: mek.key.remoteJid, chat: mek.key.remoteJid, isGroup: mek.key.remoteJid.endsWith('@g.us') };
              try { require("./Dml/daudi")(client, listM, { type: "notify" }, store); } catch (error) {}
              continue;
            }
          }

          try {
            const m = smsg(client, mek, store);
            require("./Dml/daudi")(client, m, { type: "notify" }, store).catch(e => console.error('❌ [daudi ASYNC]:', e.message));
          } catch (error) { console.error('❌ [daudi SYNC]:', error.message); }
        } catch (loopError) {}
      }
    });

    client.ev.on("messages.update", async (updates) => {
      for (const update of updates) {
        try {
          if (update.key && update.key.remoteJid === "status@broadcast" && update.update?.messageStubType === 1) {
            const settings = await getCachedSettings();
            client.sessionConfig.autoViewStatus = settings?.autoview === true || settings?.autoview === 'true';
            await handleAutoViewStatus(client, { key: update.key });
          }
        } catch (e) {}
      }
    });

    client.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
      } else return jid;
    };

    client.getName = (jid, withoutContact = false) => {
      const id = client.decodeJid(jid);
      withoutContact = client.withoutContact || withoutContact;
      let v;
      if (id.endsWith("@g.us")) {
        return new Promise(async (resolve) => {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) v = await client.groupMetadata(id);
          resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
        });
      } else {
        v = id === "0@s.whatsapp.net" ? { id, name: "WhatsApp" } : id === client.decodeJid(client.user.id) ? client.user : store.contacts[id] || {};
      }
      return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
    };

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);

    client.ev.on("group-participants.update", async (m) => {
      try { groupEvents(client, m, null); } catch (error) {}
    });

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 15;
    const baseReconnectDelay = 2000;

    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : null;

      if (connection === "open") {
        reconnectAttempts = 0;
        try { require("./Dml/daudi").prewarmCache(); } catch (e) {}
        console.log(chalk.green(`\n╭───(    `) + chalk.bold.cyan(`DML-MD`) + chalk.green(`    )───`));
        console.log(chalk.green(`> ───≫ `) + chalk.yellow(`🚀 Started Successfully`) + chalk.green(`<<───`));
        console.log(chalk.green(`> `) + chalk.white(`\`々\` 𝐒𝐭𝐚𝐭𝐮𝐬 : `) + chalk.green(`Started Successfully`));
        console.log(chalk.green(`> `) + chalk.white(`\`々\` 𝐌𝐨𝐝𝐞 : `) + chalk.cyan(`${settingss.mode || 'public'}`));
        console.log(chalk.green(`╰──────────────────☉\n`));
      }

      if (connection === "close") {
        if (global._DmlShuttingDown) return;
        global._DmlCurrentClient = null;

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          try { fs.rmSync(sessionName, { recursive: true, force: true }); } catch (e) {}
          invalidateSettingsCache();
          if (!global._DmlReconnectTimer) global._DmlReconnectTimer = setTimeout(() => { global._DmlReconnectTimer = null; startDml(); }, 2000);
          return;
        }

        if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.timedOut || reason === 408 || reason === 503 || reason === 500 || reason === 515) {
          const delay = Math.min(baseReconnectDelay * Math.pow(1.5, reconnectAttempts), 30000);
          reconnectAttempts++;
          if (!global._DmlReconnectTimer) global._DmlReconnectTimer = setTimeout(() => { global._DmlReconnectTimer = null; startDml(); }, delay);
          return;
        }

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 60000);
          reconnectAttempts++;
          if (!global._DmlReconnectTimer) global._DmlReconnectTimer = setTimeout(() => { global._DmlReconnectTimer = null; startDml(); }, delay);
          return;
        } else {
          reconnectAttempts = 0;
          if (!global._DmlReconnectTimer) global._DmlReconnectTimer = setTimeout(() => { global._DmlReconnectTimer = null; startDml(); }, 30000);
          return;
        }
      }

      try { await connectionHandler(client, update, startDml); } catch (error) {}
    });

    client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text, ...options }, { quoted });

    client.downloadMediaMessage = async (message) => {
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const validTypes = ['image', 'video', 'audio', 'sticker', 'document', 'ptv'];
      if (!validTypes.includes(messageType)) {
        if (mime.startsWith('application/') || mime.startsWith('text/')) messageType = 'document';
        else if (mime.startsWith('image/')) messageType = 'image';
        else if (mime.startsWith('video/')) messageType = 'video';
        else if (mime.startsWith('audio/')) messageType = 'audio';
        else messageType = 'document';
      }
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      return buffer;
    };

    client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const validSaveTypes = ['image', 'video', 'audio', 'sticker', 'document', 'ptv'];
      if (!validSaveTypes.includes(messageType)) {
        if (mime.startsWith('application/') || mime.startsWith('text/')) messageType = 'document';
        else if (mime.startsWith('image/')) messageType = 'image';
        else if (mime.startsWith('video/')) messageType = 'video';
        else if (mime.startsWith('audio/')) messageType = 'audio';
        else messageType = 'document';
      }
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      let type = await FileType.fromBuffer(buffer);
      const trueFileName = attachExtension && type?.ext ? (filename + '.' + type.ext) : filename;
      fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    };

    global._DmlIsStarting = false;
  } catch (error) {
    console.error('❌ [START Dml ERROR]:', error);
    global._DmlCurrentClient = null;
    global._DmlIsStarting = false;
    if (!global._DmlReconnectTimer) global._DmlReconnectTimer = setTimeout(() => { global._DmlReconnectTimer = null; startDml(); }, 5000);
  }
}

app.use(express.static('public'));
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.listen(port, () => console.log(`Server running on port ${port}`));

startDml();

module.exports = { startDml, invalidateSettingsCache };

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename} — restarting...`));
  process.exit(0);
});
