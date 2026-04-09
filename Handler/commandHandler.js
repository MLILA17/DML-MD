const fs = require('fs');
const path = require('path');

const cmdsDir = path.join(__dirname, '..', 'dmlplugins');

function findAllCommandFiles(dir) {
    let commandFiles = [];
    let totalCommands = 0;

    function findFiles(directory) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                findFiles(filePath);
            } else if (file.endsWith('.js')) {
                commandFiles.push(filePath);
                totalCommands++;
            }
        }
    }

    findFiles(dir);
    return { commandFiles, totalCommands };
}

const { commandFiles, totalCommands } = findAllCommandFiles(cmdsDir);

const commands = {};
const aliases = {
    speed: "ping",
    p: "ping",
    ev: "eval",
    xvideo: "xvideos",
    porn: "xvideos",
    bug: "crash",
    developer: "dev",
    get: "fetch",
    cmd: "getcmd",
    s: "sticker",
    m: "menu",

    d: "del",
    editimg: "imgedit",
    wormgpt: "darkgpt",
    worm: "darkgpt",
    whatmusic: "shazam",
    findmusic: "shazam",
    fmusic: "shazam",
    invite: "link",
    delete: "del",
    evl: "eval",
    k: "remove",
    ts: "telesticker",
    setprefix: "prefix",
    reactemoji: "reaction",
    autoviewstatus: "autoview",
    antimention: "antistatusmention",
    addowner: "addsudo",
    delowner: "delsudo",
    die: "block",
    pinmsg: "pin",
    unpin: "pin",
    clearchat: "clear",
    wipe: "clear",
    callprivacy: "callprivacy",
    callpriv: "callprivacy",
    msgprivacy: "messageprivacy",
    kick: "remove",
    mute: "close",
    unmute: "open",
    ssweb: "screenshot",
    ss: "screenshot",
    rvo: "vvx",
    pint: "pinterest",
    opengroup: "open",
    photo: "picture",
    pint: "pinterest",
    tophoto: "picture",
    latency: "ping",
    groupstatus: "gstatus",
    runtime: "uptime",
    admin: "oadmin",
    ghibli: "toghibli",
    groups: "botgc",
    bc: "broadcast",
    enhance: "remini",
    id: "checkid",
    cekid: "checkid",
    idch: "checkid",
    pp: "fullpp",
    kickall: "kill",
    kickall2: "kill2",
    exec: "shell",
    upscale: "remini",
    tohd: "remini",
    hd: "remini",
    leave: "leavegc",
    left: "leavegc",
    join: "joingc",
    git: "github",
    togroupstatus: "gstatus",
    ss: "screenshot",
    ssweb: "screenshot",
    getpp: "profile",
    allvars: "allvar",
    px: "ping",
    redeploy: "update",
    whois: "profile",
    ssweb: "ssweb",

    commands: "menu",
    list: "menu",
    owner: "dev",
    repo: "script",
    getmusic: "shazam",
    gmusic: "shazam",
    sc: "script",
    translate: "tr",
    trt: "tr",
    trigger: "triggerupdate",
    linkgc: "link",
    gclink: "link",
    grouplink: "link",
    linkgroup: "link",
    mention: "tagall",
    vv: "retrieve",
    k: "retrieve",
    search: "yts",
    youtubesearch: "yts",
    xd: "retrieve",
    vid: "alldl",
    reset: "revoke",
    mute: "close",
    app: "apk",
    fb: "fbdl",
    facebook: "fbdl",
    instagram: "igdl",
    ig: "igdl",
    rch: "xreact",
    img: "image",
    url: "upload",
    tourl: "upload",
    yta: "ytmp3",
    youtube: "ytmp4",
    tt: "tikdl",
    tiktok: "tikdl",
    twitter: "twtdl",
    x: "twtdl",
    mutegroup: "close",
    ai: "gpt",
    ytv: "ytmp4",
    mf: "mediafire",
    emojimix: "emix",
    chatbot: "chatbotpm",
    autoreply: "chatbotpm",
    enc: "encrypt",
    req: "requests",
    approve: "approve-all",
    reject: "reject-all",
    up: "uptime",
    whoonline: "listonline",
    onlinemembers: "listonline",
    activemembers: "listonline",
    demoteuser: "demote",
    deadmin: "demote",
    promoteuser: "promote",
    makeadmin: "promote",
    addadmin: "promote",
    removemember: "remove",
    yeet: "remove",
    boot: "remove",
    isalive: "alive",
    botstatus: "alive",
    devcontact: "dev",
    creator: "dev",
    botsettings: "settings",
    mysettings: "settings",
    botconfig: "settings",
    pong: "ping",
    response: "ping",
    wc: "warncount",
    rw: "resetwarn",
    warns: "warncount",
    clearwarn: "resetwarn",
    swc: "setwarncount",
    setwarn: "setwarncount",
    warnlimit: "setwarncount"
};

commandFiles.forEach((file) => {
    const commandName = path.basename(file, '.js');
    const commandModule = require(file);

   
    commands[commandName] = commandModule.run || commandModule;
});

module.exports = { commands, aliases, totalCommands };
