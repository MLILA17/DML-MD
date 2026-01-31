module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    try {
        if (!text) return m.reply("Provide an app name\n\nExample: .apk facebook");

        // 🔍 Search app on Aptoide
        const searchUrl = `https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}`;
        const data = await fetchJson(searchUrl);

        if (
            !data ||
            !data.datalist ||
            !data.datalist.list ||
            data.datalist.list.length === 0
        ) {
            return m.reply("❌ App not found on Aptoide.");
        }

        // 📦 Take first result
        const app = data.datalist.list[0];

        const appName = app.name;
        const apkUrl = app.file?.path;

        if (!apkUrl) {
            return m.reply("❌ APK download link not available.");
        }

        // 📥 Send APK
        await client.sendMessage(
            m.chat,
            {
                document: { url: apkUrl },
                fileName: `${appName}.apk`,
                mimetype: "application/vnd.android.package-archive",
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply("❌ APK download failed\n" + error.message);
    }
};
