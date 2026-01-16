// Active GitHub sessions (NO EXPIRY)
const githubSessions = new Map();

module.exports = async (context) => {
  const { client, m, text } = context;
  const chatId = m.chat;

  /* ================= BUTTON HANDLER (RUN FIRST) ================= */
  const buttonMsg =
    m.message?.buttonsResponseMessage ||
    m.message?.templateButtonReplyMessage;

  if (buttonMsg) {
    try {
      const buttonId =
        buttonMsg.selectedButtonId ||
        buttonMsg.selectedId;

      const session = githubSessions.get(chatId);

      if (!session) {
        return m.reply("❌ No active GitHub session. Use the command again.");
      }

      const { username, userData } = session;

      /* 📸 PROFILE PIC */
      if (buttonId === "profile_pic") {
        if (!userData.avatar_url) {
          return m.reply("❌ No profile picture available.");
        }

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
        await m.reply("📂 Fetching repositories... ⏳");

        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
        );
        const repos = await res.json();

        if (!repos.length) {
          return m.reply("No public repositories found.");
        }

        let msg = `📂 *Latest Repositories for ${username}*\n\n`;
        repos.slice(0, 5).forEach((repo, i) => {
          msg += `${i + 1}. *${repo.name}*\n`;
          msg += `📝 ${repo.description || "No description"}\n`;
          msg += `⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}\n`;
          msg += `🔗 ${repo.html_url}\n\n`;
        });

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 👥 FOLLOWERS */
      if (buttonId === "followers_info") {
        await m.reply("👥 Fetching followers... ⏳");

        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/followers?per_page=10`
        );
        const followers = await res.json();

        if (!followers.length) {
          return m.reply("No followers found.");
        }

        let msg = `👥 *Followers of ${username}*\n\n`;
        followers.slice(0, 5).forEach((f, i) => {
          msg += `${i + 1}. ${f.login}\n`;
        });

        msg += `\nTotal Followers: ${userData.followers}`;

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 🔍 MORE INFO */
      if (buttonId === "more_info") {
        const orgRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/orgs`
        );
        const orgs = await orgRes.json();

        let msg = `🔍 *Detailed Info for ${username}*\n\n`;
        msg += `📂 Repos: ${userData.public_repos}\n`;
        msg += `👥 Followers: ${userData.followers}\n`;
        msg += `➡ Following: ${userData.following}\n`;
        msg += `📅 Created: ${new Date(userData.created_at).toDateString()}\n\n`;

        msg += `🏢 *Organizations:*\n`;
        if (orgs.length) {
          orgs.forEach((o, i) => (msg += `${i + 1}. ${o.login}\n`));
        } else {
          msg += "None\n";
        }

        return client.sendMessage(chatId, { text: msg }, { quoted: m });
      }

      /* 🔄 NEW SEARCH */
      if (buttonId === "new_search") {
        githubSessions.delete(chatId);
        return m.reply("🔄 Session cleared. Send a new GitHub username.");
      }

      return m.reply("❓ Unknown button action.");

    } catch (err) {
      console.error("Button handler error:", err);
      return m.reply("❌ Button error: " + err.message);
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
      userData: data,
      createdAt: Date.now()
    });

    const info = `
👨‍💻 *GitHub User*
👤 Username: ${data.login}
📛 Name: ${data.name || "N/A"}
📝 Bio: ${data.bio || "None"}
🏢 Company: ${data.company || "N/A"}
🌍 Location: ${data.location || "N/A"}
🔗 Profile: ${data.html_url}

📊 Stats
📂 Repos: ${data.public_repos}
👥 Followers: ${data.followers}
➡ Following: ${data.following}
📅 Created: ${new Date(data.created_at).toDateString()}
`.trim();

    await client.sendMessage(chatId, { text: info }, { quoted: m });

    if (data.avatar_url) {
      await client.sendMessage(chatId, {
        image: { url: data.avatar_url },
        caption: `📸 ${data.login}`
      });
    }

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
    m.reply("❌ Failed to fetch GitHub data\n" + error.message);
  }
};

// Export sessions if needed
module.exports.githubSessions = githubSessions;
