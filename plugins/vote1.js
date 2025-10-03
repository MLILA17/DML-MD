const config = require('../config')
const { cmd } = require('../command')

// Dml Store polls in memory (resets when bot restarts)
let votes = {}

cmd({
    pattern: "vote",
    react: "🗳️",
    desc: "Create a voting poll in the group.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, reply, q }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can create a vote.");

        if (!q) {
            return reply(
                "❌ Please provide the poll question and options.\n\n" +
                "👉 Example:\n" +
                ".vote What is your favorite color? , Red, Blue, Green"
            );
        }

        const parts = q.split(",");
        if (parts.length < 3) {
            return reply("❌ You must provide at least 1 question and 2 options.");
        }

        const question = parts[0].trim();
        const options = parts.slice(1).map(o => o.trim());

        // Initialize new poll
        votes[from] = {
            question,
            options,
            results: options.map(() => []), // array of voters per option
            voters: {} // track each member’s vote (jid -> option index)
        };

        let msg = `🗳️ *${question}*\n\n`;
        options.forEach((opt, i) => {
            msg += `${i + 1}. ${opt}\n`;
        });
        msg += `\n👉 To vote, type: *.v <option number>*`;

        reply(msg);

    } catch (e) {
        console.error("Error creating vote:", e);
        reply("❌ Failed to create vote. Please try again.");
    }
});

cmd({
    pattern: "v",
    react: "✅",
    desc: "Cast your vote in the current poll.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply, q }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!votes[from]) return reply("❌ No active vote in this group. Ask an admin to create one.");

        const poll = votes[from];
        const choice = parseInt(q);

        if (isNaN(choice) || choice < 1 || choice > poll.options.length) {
            return reply(`❌ Invalid choice. Please pick a number between 1 and ${poll.options.length}.`);
        }

        // Remove previous vote if user already voted
        if (poll.voters[sender] !== undefined) {
            const prevChoice = poll.voters[sender];
            const index = poll.results[prevChoice].indexOf(sender);
            if (index !== -1) poll.results[prevChoice].splice(index, 1);
        }

        // Record new vote
        poll.results[choice - 1].push(sender);
        poll.voters[sender] = choice - 1;

        reply(`✅ Your vote for *${poll.options[choice - 1]}* has been recorded.`);

    } catch (e) {
        console.error("Error voting:", e);
        reply("❌ Failed to record your vote.");
    }
});

cmd({
    pattern: "checkvote",
    react: "📊",
    desc: "Check current poll results in the group.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!votes[from]) return reply("❌ No active vote in this group.");

        const poll = votes[from];
        let resultText = `🗳️ *${poll.question}*\n\n`;

        poll.options.forEach((opt, i) => {
            resultText += `➡️ ${opt}: ${poll.results[i].length} votes\n`;
        });

        reply(resultText);

    } catch (e) {
        console.error("Error checking vote:", e);
        reply("❌ Failed to fetch results.");
    }
});
