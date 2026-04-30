const yts = require('yt-search');

const API_URL = 'https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=';

async function fetchJson(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json,text/plain,*/*'
      },
      signal: controller.signal
    });

    const raw = await res.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`API returned invalid JSON: ${raw.slice(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

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

function deepFindTitle(data) {
  if (!data || typeof data !== 'object') return null;

  const titleKeys = [
    'title',
    'name',
    'filename',
    'fileName',
    'videoTitle',
    'song',
    'track'
  ];

  for (const key of titleKeys) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return data[key].trim();
    }
  }

  for (const value of Object.values(data)) {
    if (value && typeof value === 'object') {
      const found = deepFindTitle(value);
      if (found) return found;
    }
  }

  return null;
}

function collectUrls(data, urls = [], path = '') {
  if (!data) return urls;

  if (typeof data === 'string') {
    if (/^https?:\/\//i.test(data)) {
      urls.push({
        url: data,
        path: path.toLowerCase()
      });
    }

    return urls;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      collectUrls(item, urls, `${path}.${index}`);
    });

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

  const blocked = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'thumbnail',
    'thumb',
    'image',
    'avatar'
  ];

  const filtered = urls.filter(item => {
    const raw = `${item.path} ${item.url}`.toLowerCase();
    return !blocked.some(word => raw.includes(word));
  });

  const scored = filtered.map(item => {
    const raw = `${item.path} ${item.url}`.toLowerCase();

    let score = 0;

    if (raw.includes('mp3')) score += 70;
    if (raw.includes('audio')) score += 60;
    if (raw.includes('m4a')) score += 50;
    if (raw.includes('download')) score += 40;
    if (raw.includes('dl')) score += 25;
    if (raw.includes('url')) score += 15;
    if (raw.includes('link')) score += 10;

    return {
      ...item,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.url || null;
}

function pickThumbnail(data) {
  const urls = collectUrls(data);

  const found = urls.find(item => {
    const raw = `${item.path} ${item.url}`.toLowerCase();

    return (
      raw.includes('thumbnail') ||
      raw.includes('thumb') ||
      raw.includes('image') ||
      raw.includes('.jpg') ||
      raw.includes('.jpeg') ||
      raw.includes('.png') ||
      raw.includes('.webp')
    );
  });

  return found?.url || '';
}

async function getAudioFromApi(searchText) {
  const url = `${API_URL}${encodeURIComponent(searchText)}`;
  const data = await fetchJson(url);

  const root = data.result || data.results || data.data || data;

  const audioUrl =
    root.download_url ||
    root.downloadUrl ||
    root.download ||
    root.dlink ||
    root.dl_link ||
    root.mp3 ||
    root.audio ||
    root.url ||
    root.link ||
    pickBestAudioUrl(data);

  const title =
    deepFindTitle(data) ||
    'Unknown YouTube Song';

  const thumbnail =
    root.thumbnail ||
    root.thumb ||
    root.image ||
    pickThumbnail(data);

  return {
    audioUrl,
    title,
    thumbnail,
    raw: data
  };
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

      const youtubeLink = isYoutubeUrl(query);

      let videoUrl = query;
      let title = 'Unknown YouTube Song';
      let thumbnail = '';
      let duration = '';
      let apiSearchText = query;

      if (!youtubeLink) {
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

        // Important fix:
        // Use song title/query for this API, not only YouTube URL.
        apiSearchText = title || query;

      } else {
        const videoId = getVideoId(query);

        if (videoId) {
          const search = await yts({ videoId });

          if (search) {
            title = search.title || title;
            thumbnail = search.thumbnail || '';
            duration = search.timestamp || '';
            videoUrl = search.url || query;

            // Important fix:
            // Convert YouTube URL to title for ytplaymp3 API.
            apiSearchText = title || query;
          }
        }
      }

      let apiResult;

      try {
        apiResult = await getAudioFromApi(apiSearchText);
      } catch (firstError) {
        console.log('First API attempt failed:', firstError.message);

        // Fallback 1: try original user query
        try {
          apiResult = await getAudioFromApi(query);
        } catch (secondError) {
          console.log('Second API attempt failed:', secondError.message);

          // Fallback 2: try YouTube URL
          apiResult = await getAudioFromApi(videoUrl);
        }
      }

      const audioUrl = apiResult.audioUrl;

      title =
        apiResult.title ||
        title ||
        'Unknown YouTube Song';

      thumbnail =
        apiResult.thumbnail ||
        thumbnail ||
        '';

      if (!audioUrl) {
        console.log('API response with no audio URL:', JSON.stringify(apiResult.raw, null, 2).slice(0, 2000));

        await client.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });

        return m.reply(`╭━〔 ❌ DOWNLOAD FAILED 〕━⬣
┃ API did not return a valid MP3 URL.
┃
┃ ➤ Try another song name.
┃ ➤ Try artist name + song title.
┃ ➤ The downloader API may be temporarily down.
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
                  renderLargerThumbnail: true
                }
              }
            : undefined
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
> ⚡ Powered by Dml`
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Play error:', error);

      await client.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      }).catch(() => {});

      return m.reply(`╭━〔 🚨 PLAY ERROR 〕━⬣
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
