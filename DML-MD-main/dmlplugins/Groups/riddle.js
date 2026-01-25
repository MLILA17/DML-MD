module.exports = async (context) => {
  const { client, m, text } = context;

  // Riddle list
  const riddles = [
    { q: "I can fly without wings, who am I?", a: "The weather" },
    { q: "I'm always hungry, the more I eat, the fatter I become. Who am I?", a: "A black hole" },
    { q: "I'm strong when I'm down, but I'm weak when I'm up. Who am I?", a: "The number 6" },
    { q: "I can be short or long, hard or soft, used by kids and musicians. Who am I?", a: "A pencil" },
    { q: "I am the beginning of the end and the end of time and space. Who am I?", a: "The letter E" },
    { q: "I am white when dirty and black when clean. Who am I?", a: "A slate" },
    { q: "I'm liquid, but if you remove water, I become solid. Who am I?", a: "Tea" },
    { q: "I have cities without houses and rivers without fish. Who am I?", a: "A map" },
    { q: "I feed on air, earth, and trees. Who am I?", a: "Fire" },
    { q: "I start at night and finish in the morning. Who am I?", a: "The letter N" }
  ];

  try {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Pick random riddle
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];

    // Send question
    await m.reply(
      `🧩 *RIDDLE TIME*\n\n${riddle.q}\n\n⏳ You have *30 seconds* to think...`
    );

    // Wait 30 seconds
    await delay(30000);

    // Send answer
    await m.reply(
      `✅ *ANSWER*\n\n${riddle.a}`
    );

  } catch (error) {
    console.error(error);
    m.reply("❌ Failed to send riddle.");
  }
};
