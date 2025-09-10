// math-tutor.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { curriculum } from "./curriculum.js";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple route to check server
app.get("/", (req, res) => {
  res.send("AI Math Tutor backend is running!");
});

// Generate a question
app.post("/get-question", async (req, res) => {
  const { grade, topicIndex } = req.body;

  if (!grade || topicIndex === undefined) {
    return res.status(400).json({ error: "Grade and topicIndex required" });
  }

  try {
    const topicName = curriculum[`grade${grade}`][topicIndex];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly AI math tutor for children." },
        { role: "user", content: `Generate ONE question for grade ${grade} on the topic "${topicName}". 
Return the question in JSON format exactly like this: { "question": "...", "answer": ... }. 
Only give positive numbers appropriate for the grade. No extra text.` }
      ]
    });

    const content = response.choices[0].message.content;

    // Sometimes GPT adds extra text, so extract JSON
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const jsonStr = content.slice(jsonStart, jsonEnd);
    const questionData = JSON.parse(jsonStr);

    res.json(questionData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

app.listen(port, () => {
  console.log(`AI Math Tutor backend running on port ${port}`);
});
