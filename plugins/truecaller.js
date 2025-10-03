const axios = require("axios");
const { cmd } = require("../command");

let numberCache = {};

cmd({
    pattern: "getname",
    react: "🔎",
    desc: "Get a Truecaller-style lookup for a phone number.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a phone number.\n👉 Example: /getname +255712345678");

        // Clean the number
        const num = q.replace(/[\s()-]/g, "");

        // Check cache
        if (numberCache[num]) return reply(numberCache[num]);

        // Try to get WhatsApp contact name
        let contactName = num;
        try {
            const contact = await conn.onWhatsApp(num);
            if (contact && contact.length > 0 && contact[0].exists) {
                contactName = contact[0].notify || num;
            }
        } catch { /* ignore */ }

        // Call Numverify API
        const apiKey = "5fae6e0f3e530c6e638b6b924c6fddd3";
        const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(num)}`;
        const res = await axios.get(url);
        const data = res.data;

        let msg = `🛑 *Phone Lookup Result* ✅\n\n`;
        msg += `👤 Name: ${contactName}\n`;
        msg += `📞 Number: ${num}\n`;
        msg += `✅ Valid: ${data.valid ? "Yes" : "No"}\n`;
        msg += `🌍 Country: ${data.country_name || "Unknown"} (${data.country_code || "-"})\n`;
        msg += `📍 Location: ${data.location || "Unknown"}\n`;
        msg += `📡 Carrier: ${data.carrier || "Unknown"}\n`;
        msg += `📱 Line Type: ${data.line_type || "Unknown"}\n`;

        // Cache the result
        numberCache[num] = msg;

        reply(msg);

    } catch (e) {
        console.error("Error in getname:", e);
        reply("❌ Failed to fetch number details. Please check your API or try again.");
    }
});
