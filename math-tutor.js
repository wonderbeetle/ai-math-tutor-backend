// math-tutor.js
import express from "express";
import OpenAI from "openai";
import { curriculum } from "./curriculum.js"; // your curriculum data

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in Render environment
});

// POST endpoint to get a question
app.post("/get-question", async (req, res) => {
  const { grade, topic } = req.body;

  if (!grade || !topic) {
    return res.status(400).json({ error: "Missing grade or topic" });
  }

  try {
    // Generate question from OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly AI math tutor for Grade ${grade} students. Respond strictly in JSON with fields "question" and "answer". Do not include anything else.`,
        },
        {
          role: "user",
          content: `Give me one ${topic} question for Grade ${grade}. Only simple numbers appropriate for the grade.`
        }
      ]
    });

    // Parse and send JSON
    const data = JSON.parse(response.choices[0].message.content);
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`AI Math Tutor backend running on port ${port}`);
});
