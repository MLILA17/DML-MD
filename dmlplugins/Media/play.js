const fetch = require('node-fetch');
const yts = require('yt-search');

function isYoutubeUrl(input = '') {
  return /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(input);
}

function getVideoId(input = '') {
  const match = input.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|v\/)?([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

function safeFileName(name = 'Unknown YouTube Song') {
  return String(name)
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Unknown YouTube Song';
}

function findTitle(data) {
  if (!data || typeof data !== 'object') return null;

  const keys = ['title', 'name', 'filename', 'fileName', 'videoTitle', 'song'];

  for (const key of keys) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return data[key].trim();
    }
  }

  for (const value of Object.values(data)) {
    if (value && typeof value === 'object') {
      const found = findTitle(value);
      if (found) return found;
    }
  }

  return null;
}

function collectUrls(data, urls = [], path = '') {
  if (!data) return urls;

  if (typeof data === 'string') {
    if (/^https?:\/\//i.test(data)) {
      urls.push({ url: data, path: path.toLowerCase() });
    }
    return urls;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => collectUrls(item, urls, `${path}.${index}`));
    return urls;
  }

  if (typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      collectUrls(value, urls, path ? `${path}.${key}` : key);
    }
  }

  return urls;
}

function pickBestAudioUrl(data) {
  const urls = collectUrls(data);

  if (!urls.length) return null;

  const blocked = ['jpg', 'jpeg', 'png', 'webp', 'thumbnail', 'thumb', 'image', 'avatar'];

  const filtered = urls.filter(item => {
    const raw = `${item.path} ${item.url}`.toLowerCase();
    return !blocked.some(word => raw.includes(word));
  });

  const scored = filtered.map(item => {
    const raw = `${item.path} ${item.url}`.toLowerCase();
    let score = 0;

    if (raw.includes('audio')) score += 50;
    if (raw.includes('mp3')) score += 50;
    if (raw.includes('m4a')) score += 40;
    if (raw.includes('download')) score += 35;
    if (raw.includes('dl')) score += 25;
    if (raw.includes('url')) score += 15;
    if (raw.includes('link')) score += 10;

    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.url || null;
}

module.exports = {
  name: 'play',
  aliases: ['ply', 'p', 'ppl'],
  description: 'Searches a song on YouTube and downloads it as MP3',

  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';

      if (!query) {
        return m.reply(`╭━〔 🎵 DML MUSIC ENGINE 〕━⬣
┃ ⚠️ No input detected.
┃
┃ ➤ Send a song name or YouTube link.
┃
┃ ✦ Example:
┃   .play komasava
┃   .play https://youtu.be/dQw4w9WgXcQ
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Powered by Dml Tech`);
      }

      await client.sendMessage(m.chat, {
        react: { text: '⌛', key: m.key }
      });

      const isYoutubeLink = isYoutubeUrl(query);

      let videoUrl = query;
      let title = 'Unknown YouTube Song';
      let thumbnail = '';
      let duration = '';

      if (!isYoutubeLink) {
        const search = await yts(query);

        if (!search?.videos?.length) {
          await client.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
          });

          return m.reply(`╭━〔 🔎 NO RESULTS FOUND 〕━⬣
┃ No matching results for:
┃ ➤ "${query}"
┃
┃ Try:
┃   • Different keywords
┃   • Artist name + song title
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DmlSearch Engine`);
        }

        const video = search.videos[0];

        videoUrl = video.url;
        title = video.title || title;
        thumbnail = video.thumbnail || '';
        duration = video.timestamp || '';
      } else {
        const videoId = getVideoId(query);

        if (videoId) {
          const search = await yts({ videoId });

          if (search) {
            title = search.title || title;
            thumbnail = search.thumbnail || '';
            duration = search.timestamp || '';
            videoUrl = search.url || query;
          }
        }
      }

      const apiUrl = `https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(videoUrl)}`;

      const response = await fetch(apiUrl);
      const textData = await response.text();

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      let data;

      try {
        data = JSON.parse(textData);
      } catch {
        throw new Error('Invalid JSON response from the API');
      }

      const result = data.result || data.results || data.data || data;

      const audioUrl =
        result.download_url ||
        result.downloadUrl ||
        result.download ||
        result.dlink ||
        result.dl_link ||
        result.mp3 ||
        result.audio ||
        result.url ||
        result.link ||
        pickBestAudioUrl(result);

      title =
        findTitle(result) ||
        title ||
        'Unknown YouTube Song';

      thumbnail =
        result.thumbnail ||
        result.thumb ||
        result.image ||
        thumbnail ||
        '';

      if (!audioUrl) {
        await client.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });

        return m.reply(`╭━〔 ❌ DOWNLOAD FAILED 〕━⬣
┃ Unable to process your request.
┃
┃ ➤ Possible Reasons:
┃   • Song not found
┃   • Video unavailable
┃   • API returned no audio URL
┃
┃ Please try again.
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DmlDownloader`);
      }

      const safeTitle = safeFileName(title);

      await client.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false,
          contextInfo: thumbnail
            ? {
                externalAdReply: {
                  title: safeTitle.substring(0, 40),
                  body: duration ? `Duration: ${duration}` : 'DML-MD',
                  thumbnailUrl: thumbnail,
                  sourceUrl: videoUrl,
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
              }
            : undefined,
        },
        { quoted: m }
      );

      await client.sendMessage(
        m.chat,
        {
          document: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          caption: `╭━〔 🎶 NOW PLAYING 〕━⬣
┃ 🎧 ${safeTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}⬇️ Download completed successfully
┃ 📀 Format: MP3
┃ 🎚️ Quality: 128kbps
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by Dml`,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Play error:', error);

      await client.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });

      await m.reply(`╭━〔 🚨 PLAY ERROR 〕━⬣
┃ Something went wrong while processing.
┃
┃ Error:
┃ ${error.message}
┃
┃ Please try again later.
╰━━━━━━━━━━━━━━━━━━⬣
> 🛠️ DML-MD System`);
    }
  }
};
