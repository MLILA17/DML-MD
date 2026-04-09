const {
  default: DmlConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers,
  generateWAMessageContent,
  generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const FileType = require("file-type");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const figlet = require("figlet");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../lib/exif.js');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('../lib/botFunctions.js');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const authenticationn = require('../Auth/auth.js');
const { smsg } = require('../Handler/smsg.js');
const { getSettings, getBannedUsers, banUser } = require("../Database/config.js");

const { botname } = require('../Env/settings.js');
const { DateTime } = require('luxon');
const { commands, totalCommands } = require('../Handler/commandHandler.js');
authenticationn();

const path = require('path');
const sessionName = path.join(__dirname, '..', 'Session');

const groupEvents = require("../Handler/eventHandler.js");
const groupEvents2 = require("../Handler/eventHandler.js");
const connectionHandler = require('../Handler/connectionHandler.js');
const antidelete = require('../Functions/antidelete.js');
const antilink = require('../Functions/antilink.js');
const antistatusmention = require('../Functions/antistatusmention.js');

function cleanupSessionFiles() {
    try {
        if (!fs.existsSync(sessionName)) return;
        const files = fs.readdirSync(sessionName);
        const keepFiles = ['creds.json', 'app-state-sync-version.json', 'pre-key-', 'session-', 'sender-key-', 'app-state-sync-key-'];
        files.forEach(file => {
            const filePath = path.join(sessionName, file);
            const stats = fs.statSync(filePath);
            const shouldKeep = keepFiles.some(pattern => {
                if (pattern.endsWith('-')) return file.startsWith(pattern);
                return file === pattern;
            });
            if (!shouldKeep) {
                const fileAge = Date.now() - stats.mtimeMs;
                if (fileAge / (1000 * 60 * 60) > 24) {
                    fs.unlinkSync(filePath);
                }
            }
        });
    } catch (error) {
        console.error('Session cleanup error:', error.message);
    }
}

async function startDml() {
  setInterval(cleanupSessionFiles, 24 * 60 * 60 * 1000);
  cleanupSessionFiles();

  let settingss = await getSettings();
  if (!settingss) {
    console.log(`DML-MD FAILED TO CONNECT - Settings not found`);
    return;
  }

  const { autobio, mode, anticall } = settingss;
  const { saveCreds, state } = await useMultiFileAuthState(sessionName);

  const client = DmlConnect({
    printQRInTerminal: false,
    syncFullHistory: true,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    version: [2,3000,1033105955],
    browser: ["Ubuntu", 'Chrome', "20.0.04"],
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent", stream: 'store' }))
    }
  });

  store.bind(client.ev);
  setInterval(() => store.writeToFile("store.json"), 3000);

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

  client.ws.on('CB:call', async (json) => {
    const settingszs = await getSettings();
    if (!settingszs?.anticall) return;

    const callId = json.content[0].attrs['call-id'];
    const callerJid = json.content[0].attrs['call-creator'];

    const isGroupCall = callerJid.endsWith('@g.us');
    if (isGroupCall) return;

    const callerNumber = callerJid.replace(/[@.a-z]/g, "");
    if (processedCalls.has(callId)) return;
    processedCalls.add(callId);

    const fakeQuoted = {
      key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net', id: callId },
      message: { conversation: "Verified" },
      contextInfo: { mentionedJid: [callerJid], forwardingScore: 999, isForwarded: true }
    };

    await client.rejectCall(callId, callerJid);
    await client.sendMessage(callerJid, {
      text: "> Calling without permission is highly prohibited ⚠️!"
    }, { quoted: fakeQuoted });

    const bannedUsers = await getBannedUsers();
    if (!bannedUsers.includes(callerNumber)) await banUser(callerNumber);
  });

  const processedStatusMessages = new Set();

  client.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    let settings = await getSettings();
    if (!settings) return;

    const { autoread, autolike, autoview, presence, autolikeemoji } = settings;

    let mek = messages[0];
    if (!mek || !mek.key) return;

    const remoteJid = mek.key.remoteJid;
    const sender = client.decodeJid(mek.key.participant || mek.key.remoteJid);

    if (remoteJid === "status@broadcast") {
      if (autolike && mek.key) {
        try {
          let reactEmoji = autolikeemoji || 'random';
          if (reactEmoji === 'random') {
            const emojis = ['❤️', '👍', '🔥', '😍', '👏', '🎉', '🤩', '💯', '✨', '🌟'];
            reactEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          }
          const nickk = client.decodeJid(client.user.id);
          await client.sendMessage(mek.key.remoteJid, {
            react: { text: reactEmoji, key: mek.key }
          }, { statusJidList: [mek.key.participant, nickk] });
        } catch (sendError) {
          try {
            await client.sendMessage(mek.key.remoteJid, {
              react: { text: reactEmoji, key: mek.key }
            });
          } catch (error2) {
            console.error('[AUTOLIKE] Failed to react:', error2.message);
          }
        }
      }

      if (autoview) {
        try {
          await client.readMessages([mek.key]);
          setTimeout(async () => {
            try { await client.readMessages([mek.key]); } catch (e) {}
          }, 500);
        } catch (error) {
          console.error('[AUTOVIEW] Failed to view:', error.message);
        }
      }
      return;
    }

    if (!mek.message) return;

    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage"
      ? mek.message.ephemeralMessage.message
      : mek.message;

    if (!mek.message) {
      console.error('[MESSAGE HANDLER] mek.message is undefined');
      return;
    }

    await antilink(client, mek, store);

    if (autoread && remoteJid.endsWith('@s.whatsapp.net')) {
      try { await client.readMessages([mek.key]); } catch (e) {}
    }

    if (remoteJid.endsWith('@s.whatsapp.net')) {
      try {
        if (presence === 'online') await client.sendPresenceUpdate("available", remoteJid);
        else if (presence === 'typing') await client.sendPresenceUpdate("composing", remoteJid);
        else if (presence === 'recording') await client.sendPresenceUpdate("recording", remoteJid);
        else await client.sendPresenceUpdate("unavailable", remoteJid);
      } catch (e) {}
    }

    if (!client.public && !mek.key.fromMe) return;

    try {
      m = smsg(client, mek, store);
      require("./daudi")(client, m, { type: "notify" }, store);
    } catch (error) {
      console.error('[MESSAGE HANDLER] Error:', error.message);
    }
  });

  client.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    if (msg.message.listResponseMessage) {
      const selectedCmd = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
      const settings = await getSettings();
      const effectivePrefix = settings?.prefix || '.';
      let command = selectedCmd.startsWith(effectivePrefix)
        ? selectedCmd.slice(effectivePrefix.length).toLowerCase()
        : selectedCmd.toLowerCase();

      const m = {
        ...msg,
        body: selectedCmd,
        text: selectedCmd,
        command,
        prefix: effectivePrefix,
        sender: msg.key.remoteJid,
        from: msg.key.remoteJid,
        chat: msg.key.remoteJid,
        isGroup: msg.key.remoteJid.endsWith('@g.us')
      };

      try {
        require("./daudi")(client, m, { type: "notify" }, store);
      } catch (error) {
        console.error('[LIST SELECTION] Error:', error.message);
      }
    }
  });

  client.ev.on("messages.update", async (updates) => {
    for (const update of updates) {
      if (update.key && update.key.remoteJid === "status@broadcast" && update.update.messageStubType === 1) {
        const settings = await getSettings();
        if (settings.autoview) {
          try { await client.readMessages([{ key: update.key, message: {} }]); } catch (e) {}
        }
      }
    }
  });

  process.on("unhandledRejection", (reason) => {
    console.error('[UNHANDLED ERROR]', reason.message?.substring(0, 200) || reason);
  });

  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  client.getName = (jid, withoutContact = false) => {
    id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v = id === "0@s.whatsapp.net"
        ? { id, name: "WhatsApp" }
        : id === client.decodeJid(client.user.id)
          ? client.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.public = true;
  client.serializeM = (m) => smsg(client, m, store);

  client.ev.on("group-participants.update", async (m) => {
    try {
      groupEvents(client, m);
      groupEvents2(client, m);
    } catch (error) {
      console.error('[GROUP EVENT] Error:', error.message);
    }
  });

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 5000;

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : null;

    if (connection === "open") {
      reconnectAttempts = 0;
      console.log(chalk.green(`\n╭───(    DML-𝐌D    )───`));
      console.log(chalk.green(`> ───≫ 🚀 Started Successfully <<───`));
      console.log(chalk.green(`> `) + chalk.white(`\`✅\` 𝐒𝐭𝐚𝐭𝐮𝐬 : `) + chalk.green(`Started Successfully`));
      console.log(chalk.green(`> `) + chalk.white(`\`✅\` 𝐌𝐨𝐝𝐞 : `) + chalk.cyan(`${settingss.mode || 'public'}`));
      console.log(chalk.green(`╰──────────────────☉`));
      console.log(chalk.green(`> NEW\n`));
    }

    if (connection === "close") {
      if (reason === DisconnectReason.loggedOut || reason === 401) {
        await fs.rmSync(sessionName, { recursive: true, force: true });
        return startDml();
      }
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        setTimeout(() => startDml(), delay);
      }
    }

    await connectionHandler(client, update, startDml);
  });

  client.ev.on("creds.update", saveCreds);

  client.sendText = (jid, text, quoted = "", options) =>
    client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    let type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };
}

app.use(express.static('public'));
app.get("/", (req, res) => res.sendFile(__dirname + '/index.html'));
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

startDml();
module.exports = startDml;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
