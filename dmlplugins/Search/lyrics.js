const fetch = require('node-fetch');

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) {
        return client.sendMessage(
            m.chat,
            {
                text: `╔═══════════════╗
║ 🎵 LYRICS TOOL
╚═══════════════╝
Please tell me a song title.

📌 Example:
.lyrics Alone ft Ava Max`
            },
            { quoted: m }
        );
    }

    try {
        const encodedText = encodeURIComponent(text);
        const apiUrl = `https://api.deline.web.id/tools/lyrics?title=${encodedText}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || data.result.length === 0) {
            return client.sendMessage(
                m.chat,
                {
                    text: `╔═══════════════╗
║ ❌ NOT FOUND
╚═══════════════╝
No lyrics found for:
"${text}"

Try another song 🎧`
                },
                { quoted: m }
            );
        }

        const song = data.result[0];

        if (!song.plainLyrics) {
            return client.sendMessage(
                m.chat,
                {
                    text: `╔═══════════════╗
║ ⚠️ UNAVAILABLE
╚═══════════════╝
Lyrics exist but not in plain text.
Try a different song.`
                },
                { quoted: m }
            );
        }

        const lyrics = song.plainLyrics;
        const title = song.trackName || song.name || 'Unknown Title';
        const artist = song.artistName || 'Unknown Artist';

        // preview (WhatsApp safe)
        const preview = lyrics.length > 3500
            ? lyrics.slice(0, 3500) + '\n\n...'
            : lyrics;

        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: '🎶 SONG LYRICS',
                    title:
`🎧 Title  : ${title}
🎤 Artist : ${artist}

───────────────
${preview}
───────────────

Tap below to copy full lyrics`,
                    footer: '> © Powered by Dml',
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: ' Copy Lyrics',
                                id: 'copy_song_lyrics',
                                copy_code: lyrics
                            })
                        }
                    ]
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(`LYRICS API ERROR: ${error.message}`);

        await client.sendMessage(
            m.chat,
            {
                text: `╔═══════════════╗
║ 💥 ERROR
╚═══════════════╝
Failed to fetch lyrics.
Please try again later.`
            },
            { quoted: m }
        );
    }
};
