// server.js
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Health check route ---
app.get("/", (req, res) => {
  res.send("✅ Mindstyle API is running");
});

// --- Recommend route ---
app.post("/recommend", async (req, res) => {
  try {
    const { loved = [], disliked = [] } = req.body;

    if (!loved.length && !disliked.length) {
      return res.status(400).json({ error: "Missing input books" });
    }

    const prompt = `
You are a book recommendation AI.
User loved: ${loved.join(", ")}
User disliked: ${disliked.join(", ")}
Recommend 5 books. For each:
BOOK: [Title] — [Author] ([Year])
WHY: One short reason they'll love it.
CAVEAT: One short potential downside.
SCORE: from +0.0 to +1.0 based on alignment with user taste.
Keep output structured and compact.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const result = response.choices[0].message.content;
    res.json({ result });
  } catch (err) {
    console.error("❌ Error in /recommend:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Mindstyle API running at http://localhost:${PORT}`);
});
