// Active GitHub sessions (NO EXPIRY)
const githubSessions = new Map();

module.exports = async (context) => {
  const { client, m, text } = context;
  const chatId = m.chat;

  /* ================= BUTTON HANDLER (RUN FIRST) ================= */
  const btnResponse =
    m.message?.buttonsResponseMessage ||
    m.message?.templateButtonReplyMessage;

  if (btnResponse) {
    try {
      const buttonId =
        btnResponse.selectedButtonId || btnResponse.selectedId;

      const session = githubSessions.get(chatId);

      if (!session) {
        return m.reply("❌ Session expired. Send GitHub username again.");
      }

      const { username, userData } = session;

      /* 📸 PROFILE PIC */
      if (buttonId === "profile_pic") {
        return client.sendMessage(
          chatId,
          {
            image: { url: userData.avatar_url },
            caption: `📸 Profile picture of ${username}`
          },
          { quoted: m }
        );
      }

      /* 📂 REPOSITORIES */
      if (buttonId === "repos_info") {
        await m.reply("📂 Fetching repositories...");

        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
        );
        const repos = await res.json();

        if (!repos.length) {
          return m.reply("No repositories found.");
        }

        let msg = `📂 *Repositories for ${username}*\n\n`;
        repos.slice(0, 5).forEach((r, i) => {
          msg += `${i + 1}. *${r.name}*\n`;
          msg += `⭐ ${r.stargazers_count} | 🍴 ${r.forks_count}\n`;
          msg += `${r.html_url}\n\n`;
        });

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 👥 FOLLOWERS */
      if (buttonId === "followers_info") {
        await m.reply("👥 Fetching followers...");

        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/followers?per_page=10`
        );
        const followers = await res.json();

        if (!followers.length) {
          return m.reply("No followers found.");
        }

        let msg = `👥 *Followers*\n\n`;
        followers.slice(0, 5).forEach((f, i) => {
          msg += `${i + 1}. ${f.login}\n`;
        });

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 🔍 MORE INFO */
      if (buttonId === "more_info") {
        let msg = `🔍 *More Info for ${username}*\n\n`;
        msg += `📂 Repos: ${userData.public_repos}\n`;
        msg += `👥 Followers: ${userData.followers}\n`;
        msg += `➡ Following: ${userData.following}\n`;
        msg += `📅 Created: ${new Date(userData.created_at).toDateString()}`;

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 🔄 NEW SEARCH */
      if (buttonId === "new_search") {
        githubSessions.delete(chatId);
        return m.reply("🔄 Session cleared. Send a new GitHub username.");
      }

      return m.reply("❓ Unknown button action.");

    } catch (err) {
      console.error("Button Error:", err);
      return m.reply("❌ Button handling failed.");
    }
  }

  /* ================= MAIN COMMAND ================= */
  if (!text) {
    return m.reply("Provide a GitHub username to stalk");
  }

  try {
    await m.reply(`🔍 Fetching GitHub data for *${text}*...`);

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(text)}`
    );
    const data = await res.json();

    if (data.message === "Not Found") {
      return m.reply("❌ GitHub user not found.");
    }

    githubSessions.set(chatId, {
      username: data.login,
      userData: data
    });

    const info = `
👨‍💻 *GitHub User*
👤 Username: ${data.login}
📝 Bio: ${data.bio || "None"}
📂 Repos: ${data.public_repos}
👥 Followers: ${data.followers}
`.trim();

    await client.sendMessage(chatId, { text: info }, { quoted: m });

    const buttons = [
      { buttonId: "profile_pic", buttonText: { displayText: "📸 Profile Pic" }, type: 1 },
      { buttonId: "repos_info", buttonText: { displayText: "📂 Repositories" }, type: 1 },
      { buttonId: "followers_info", buttonText: { displayText: "👥 Followers" }, type: 1 },
      { buttonId: "more_info", buttonText: { displayText: "🔍 More Info" }, type: 1 },
      { buttonId: "new_search", buttonText: { displayText: "🔄 New Search" }, type: 1 }
    ];

    await client.sendMessage(chatId, {
      text: `💻 *GitHub Menu for ${data.login}*`,
      buttons,
      headerType: 1
    });

  } catch (error) {
    console.error(error);
    m.reply("❌ Failed to fetch GitHub data");
  }
};
