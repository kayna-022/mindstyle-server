// server/server.js  (CommonJS, safe ASCII)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

console.log("Starting Mindstyle server...");

const app = express();
app.use(cors());
app.use(bodyParser.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -------- RECOMMENDATIONS --------
app.post("/recs", async (req, res) => {
  try {
    const { loved = [], disliked = [], taste = {} } = req.body || {};
    const prompt =
      "You are a book recommendation AI that outputs exactly 5 books.\n" +
      "User loved: " + (loved.join("; ") || "none") + "\n" +
      "User disliked: " + (disliked.join("; ") || "none") + "\n" +
      "Taste (0-1): " + JSON.stringify(taste) + "\n\n" +
      "Format for EACH book (4 lines, no extras):\n" +
      "BOOK: Title — Author (Year)\n" +
      "WHY: one short sentence why they'll like it\n" +
      "CAVEAT: one short sentence they might not like\n" +
      "SCORE: +N";

    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.json({ recs: resp.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
});

// -------- BOOK CHAT --------
app.post("/chat", async (req, res) => {
  try {
    const { book, question, spoilerLevel = 2 } = req.body || {};
    const system =
      "You are a careful book guide. Spoiler level " + spoilerLevel + "/5.\n" +
      "0-2: avoid future plot spoilers; use themes/style/setting only.\n" +
      "3-4: mild spoilers allowed.\n" +
      "5: full spoilers allowed. Keep answers concise.";

    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Book: " + book + "\nQuestion: " + question },
      ],
      temperature: 0.7,
    });

    res.json({ answer: resp.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
});

const PORT = 8787;
app.listen(PORT, function () {
  console.log("Mindstyle API running at http://localhost:" + PORT);
});
