import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/recommend", async (req, res) => {
  try {
    const { loved = [], disliked = [], query = "" } = req.body;

    const lovedText =
      loved.length > 0 ? `They enjoyed: ${loved.join(", ")}.` : "";
    const dislikedText =
      disliked.length > 0 ? `They didn’t enjoy: ${disliked.join(", ")}.` : "";
    const queryText = query ? `They said: "${query}".` : "";

    const prompt = `
You are an expert at recommending books that emotionally match the user's taste and mood.

${lovedText}
${dislikedText}
${queryText}

Recommend 5 books. For each, give:
BOOK: [Title] by [Author]
WHY THEY’D LIKE IT: [A short, human summary explaining why this person in particular would love it — mention tone, emotion, and vibe instead of analysis.]
Skip scores, bullet points, or caveats. Make it sound personal and conversational.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    res.json({ result: data.choices?.[0]?.message?.content || "No recs found." });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Mindstyle API running on port ${PORT}`));
