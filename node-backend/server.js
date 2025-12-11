// ------------------ IMPORTS ------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Groq = require("groq-sdk");

dotenv.config();
const app = express();

// ------------------ GROQ SETUP ------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fastest stable model as of 2025
const CURRENT_MODEL = "llama-3.3-70b-versatile";

// ------------------ CORS ------------------
app.use(
  cors({
    origin: "*", // Hackathon-safe
    credentials: true,
  })
);

app.use(express.json());

// ------------------ CHAT MEMORY ------------------
const chatHistories = new Map();

// ------------------ LOAD KNOWLEDGE BASE ------------------
const ragPath = path.join(__dirname, "rag", "visa_knowledge.txt");
let KNOWLEDGE_TEXT = "General visa rules and document requirements.";

if (fs.existsSync(ragPath)) {
  KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
  console.log("✅ Visa Knowledge Base Loaded");
} else {
  console.log("⚠️ No rag/visa_knowledge.txt found. Using fallback.");
}

// ------------------ SYSTEM MESSAGE ------------------
const SYSTEM_MESSAGE = `
You are "VisaExpert AI", a warm, friendly, highly strategic visa consultant.

YOUR STYLE:
- Keep replies SHORT, helpful, and natural.
- First analyze the user's ML prediction + profile.
- Highlight the MAIN factor affecting approval (criminal record, income, travel, ties).
- Give simple, clear improvements.
- Do NOT always use phases — only when helpful.
- Avoid long robotic templates.
- Respond like a human consultant, not a script.
`;

// ------------------ GROQ CALL ------------------
async function callGroqAI(messages) {
  try {
    const completion = await groq.chat.completions.create({
      model: CURRENT_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Groq Error:", err);
    return "⚠️ The consultant is currently unavailable. Try again shortly.";
  }
}

// ------------------ MAIN CHAT HANDLER ------------------
async function handleChatMessage(req, res) {
  let { message, sessionId, userProfile, modelPrediction } = req.body;

  if (!message)
    return res.status(400).json({ error: "Message is required" });

  // Start new session
  if (!sessionId) {
    sessionId = uuidv4();
    console.log("🆕 New Session:", sessionId);
  }

  // Retrieve memory
  let history = chatHistories.get(sessionId) || [];

  // Context summary
  const ragContext = `
User Profile:
${JSON.stringify(userProfile || {}, null, 2)}

ML Model Result:
${JSON.stringify(modelPrediction || {}, null, 2)}

Knowledge Base:
${KNOWLEDGE_TEXT.substring(0, 1500)}

IMPORTANT:
- Use this info to respond naturally.
- Focus on the strongest factor affecting approval.
- Keep answers short and friendly.
`;

  // Build messages for Groq API
  const messages = [
    { role: "system", content: SYSTEM_MESSAGE },
    { role: "system", content: ragContext },
    ...history.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  // Get AI response
  const aiResponse = await callGroqAI(messages);

  // Save conversation memory (last 10 turns max)
  history.push({ role: "user", text: message });
  history.push({ role: "bot", text: aiResponse });

  if (history.length > 20) history = history.slice(-20);

  chatHistories.set(sessionId, history);

  res.json({
    sessionId,
    response: aiResponse,
    history,
  });
}

// ------------------ SIMPLE QUEUE SYSTEM ------------------
const queue = [];
let isProcessing = false;

function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const { req, res } = queue.shift();
  handleChatMessage(req, res)
    .finally(() => {
      isProcessing = false;
      processQueue();
    });
}

app.post("/api/chat/message", (req, res) => {
  queue.push({ req, res });
  processQueue();
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VisaExpert AI (GROQ) running → http://localhost:${PORT}`);
  console.log(`⚡ Model in use: ${CURRENT_MODEL}`);
});
