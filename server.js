const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Basic test route
app.get("/", (req, res) => {
  res.send("✅ Mindstyle API is running");
});

// ✅ Book recommendation endpoint
app.post("/recommend", async (req, res) => {
  try {
    const { loved = [], disliked = [] } = req.body;

    const prompt = `
You are a book recommendation AI.
User loved: ${loved.join(", ")}.
User disliked: ${disliked.join(", ")}.

Recommend 5 books in this format:
BOOK: Title — Author (Year)
WHY: one short sentence why they'd love it.
CAVEAT: one possible downside.
SCORE: rate from +0.1 to +1.0
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise book recommender." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:",

