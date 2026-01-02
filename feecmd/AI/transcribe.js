const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

module.exports = async (context) => {
  const { client, m } = context;
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || '';

  if (!/audio|video/.test(mime)) {
    return m.reply('Send or reply to an audio/video file with the caption _transcribe_idiot');
  }

  m.reply('*Processing, please wait...*');

  try {
    const buffer = await m.quoted.download();

    if (buffer.length > 5 * 1024 * 1024) {
      return m.reply('Maximum file size is 5 MB.');
    }

    const result = await transcribeWithTalknotes(buffer);

    if (!result || !result.text) {
      return m.reply('Failed to extract text. Please try again later.');
    }

    return m.reply(`*Transcription Result:*\n\n${result.text}`);
  } catch (error) {
    console.error(error);
    m.reply('An error occurred while processing the file.');
  }
};

function generateToken(secretKey) {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(timestamp);
  const token = hmac.digest('hex');

  return {
    'x-timestamp': timestamp,
    'x-token': token
  };
}

async function transcribeWithTalknotes(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg'
    });

    const tokenData = generateToken('w0erw90wr3rnhwoi3rwe98sdfihqio432033we8rhoeiw');

    const headers = {
      ...form.getHeaders(),
      ...tokenData,
      'referer': 'https://talknotes.io/',
      'origin': 'https://talknotes.io',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    };

    const { data } = await axios.post('https://api.talknotes.io/tools/converter', form, { headers });

    return data;
  } catch (err) {
    console.error('Talknotes error:', err.message);
    return null;
  }
}