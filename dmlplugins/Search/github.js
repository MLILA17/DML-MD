// Active GitHub sessions 🤨
const githubSessions = new Map();

module.exports = async (context) => {
  const { client, m, text } = context;
  const chatId = m.chat;

  // ================= MAIN COMMAND =================
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

    // Save session (optional)
    githubSessions.set(chatId, {
      username: data.login,
      userData: data,
      createdAt: Date.now()
    });

    const info = `
👨‍💻 *GitHub User Info*

👤 Username: ${data.login}
📛 Name: ${data.name || "N/A"}
📝 Bio: ${data.bio || "None"}
🏢 Company: ${data.company || "N/A"}
🌍 Location: ${data.location || "N/A"}
🔗 Profile: ${data.html_url}

📊 *Stats*
📂 Public Repos: ${data.public_repos}
👥 Followers: ${data.followers}
➡ Following: ${data.following}
📅 Created: ${new Date(data.created_at).toDateString()}
`.trim();

    // Send ONLY text info
    await client.sendMessage(chatId, { text: info }, { quoted: m });

    // Fetch repositories
    const repoRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(data.login)}/repos?sort=updated&per_page=5`
    );
    const repos = await repoRes.json();

    if (repos.length) {
      let repoMsg = `📂 *Latest Repositories*\n\n`;
      repos.forEach((r, i) => {
        repoMsg += `${i + 1}. *${r.name}*\n`;
        repoMsg += `⭐ ${r.stargazers_count} | 🍴 ${r.forks_count}\n`;
        repoMsg += `${r.html_url}\n\n`;
      });

      await client.sendMessage(chatId, { text: repoMsg }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    m.reply("❌ Failed to fetch GitHub data\n" + error.message);
  }
};

// Export sessions if needed elsewhere
module.exports.githubSessions = githubSessions;
