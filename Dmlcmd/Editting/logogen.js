const axios = require('axios');

module.exports = async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("Enter title, idea, and slogan.\nFormat: _logogen Title|Idea|Slogan_\n\n*Example:* _logogen Fredi Ai|AI-Powered Services|Innovation Meets Simplicity_");
  }

  const [title, idea, slogan] = text.split("|");

  if (!title || !idea || !slogan) {
    return m.reply("Incorrect format.\nUse: _logogen Title|Idea|Slogan_");
  }

  try {
    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea,
      industry_index: "N",
      industry_index_id: "",
      pagesize: 4,
      session_id: "",
      slogan,
      title,
      whiteEdge: 80,
      width: 400,
    };

    const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);

    if (!data.data.logoList || data.data.logoList.length === 0) {
      return m.reply("Failed to generate logo. Please try again.");
    }

    for (const logo of data.data.logoList) {
      await client.sendMessage(m.chat, {
        image: { url: logo.logo_thumb },
        caption: `_Generated Logo for "${title}"_`
      }, { quoted: m });
    }
  } catch (err) {
    console.error("Logo generation error:", err);
    await m.reply("An error occurred while creating the logo.");
  }
};
//Bro Dml