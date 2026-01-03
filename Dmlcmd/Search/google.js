module.exports = async (context) => {
  const { client, m, text } = context;
  const axios = require("axios");

  if (!text) {
    m.reply(
      "╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n" +
      "│ ❒ ERROR\n" +
      "╰┈┈┈┈━━━━━━┈┈┈┈◈\n" +
      "┋ 🚫 Please provide a search term!\n" +
      "┋ ❒ Example: .google What is treason\n" +
      "╰┈┈┈┈━━━━━━┈┈┈┈◈◈"
    );
    return;
  }

  try {
    let { data } = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`
    );

    if (data.items.length == 0) {
      m.reply(
        "╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n" +
        "│ ❒ ERROR\n" +
        "╰┈┈┈┈━━━━━━┈┈┈┈◈\n" +
        "┋ ❌ Unable to find any results\n" +
        "╰┈┈┈┈━━━━━━┈┈┈┈◈◈"
      );
      return;
    }

    let tex = "";
    tex += "╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n";
    tex += "│ ❒ GOOGLE SEARCH\n";
    tex += "╰┈┈┈┈━━━━━━┈┈┈┈◈\n";
    tex += "┋ 🔍 Search Term: " + text + "\n";
    tex += "╰┈┈┈┈━━━━━━┈┈┈┈◈\n";

    for (let i = 0; i < data.items.length; i++) {
      tex += "┋ ❒ Result " + (i + 1) + "\n";
      tex += "┋ 🪧 Title: " + data.items[i].title + "\n";
      tex += "┋ 📝 Description: " + data.items[i].snippet + "\n";
      tex += "┋ 🌐 Link: " + data.items[i].link + "\n";
      tex += "╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n";
    }

    m.reply(tex);
  } catch (e) {
    m.reply(
      "╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n" +
      "│ ❒ ERROR\n" +
      "╰┈┈┈┈━━━━━━┈┈┈┈◈\n" +
      "┋ ❌ An error occurred: " + e.message + "\n" +
      "╰┈┈┈┈━━━━━━┈┈┈┈◈◈"
    );
  }
};