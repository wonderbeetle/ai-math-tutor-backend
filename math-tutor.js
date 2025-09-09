// math-tutor.js
import OpenAI from "openai";
import readline from "readline";
import { curriculum } from "./curriculum.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askAI(grade, topic) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly AI math tutor for Grade ${grade}. Ask ONE math question only, related to this topic: ${topic}. Keep it simple, avoid negative numbers for Grade 1–3.`
        },
        {
          role: "user",
          content: `Return JSON only. Format: { "question": "string", "answer": number }`
        }
      ]
    });

    let aiReply = response.choices[0].message.content.trim();
    aiReply = aiReply.replace(/```json|```/g, "").trim();
    return JSON.parse(aiReply);
  } catch (err) {
    console.error("❌ Error asking AI:", err);
    return null;
  }
}

async function runTutor() {
  rl.question("Enter grade level (1–6): ", async (gradeInput) => {
    const grade = parseInt(gradeInput);
    if (isNaN(grade) || grade < 1 || grade > 6) {
      console.log("❌ Invalid grade. Please enter 1–6.");
      rl.close();
      return;
    }

    const topics = curriculum[`grade${grade}`];
    console.log(`Available topics for Grade ${grade}:`);
    topics.forEach((t, i) => console.log(`${i + 1}. ${t}`));

    rl.question("Choose a topic number: ", async (topicInput) => {
      const topicIndex = parseInt(topicInput) - 1;
      if (isNaN(topicIndex) || topicIndex < 0 || topicIndex >= topics.length) {
        console.log("❌ Invalid topic number.");
        rl.close();
        return;
      }

      const topic = topics[topicIndex];

      async function nextQuestion() {
        const q = await askAI(grade, topic);
        if (!q) {
          rl.close();
          return;
        }

        console.log(`\n📘 AI Tutor says:\n${q.question}\n`);

        rl.question("Your answer (or type 'exit' to quit): ", (userAnswer) => {
          if (userAnswer.toLowerCase() === "exit") {
            console.log("\n👋 Goodbye! Great work today!");
            rl.close();
            return;
          }

          if (parseInt(userAnswer) === q.answer) {
            console.log("✅ Correct! Great job!");
          } else {
            console.log(`❌ Not quite. The correct answer is ${q.answer}.`);
          }

          nextQuestion();
        });
      }

      nextQuestion();
    });
  });
}

runTutor();
