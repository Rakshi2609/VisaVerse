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

// ------------------ SAFETY CHECKS ------------------
if (!process.env.GROQ_API_KEY) {
  console.error("❌ CRITICAL: GROQ_API_KEY is missing from Environment Variables!");
}

// ------------------ GROQ SETUP ------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_to_prevent_crash_on_init",
});

const CURRENT_MODEL = "llama-3.3-70b-versatile";

// ------------------ CORS SETUP ------------------
// Fallback to '*' if CLIENT_URL is missing to prevent crash during demo
const clientUrl = process.env.CLIENT_URL || "*"; 

const whitelist = [
  clientUrl,
  "http://localhost:5173", 
  "http://localhost:3000", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      // If whitelist contains '*', allow everyone (Safe for Hackathon)
      if (whitelist.includes("*") || whitelist.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        return callback(null, true); // Allow anyway to prevent demo crashes
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ------------------ CHAT MEMORY ------------------
const chatHistories = new Map();

// ------------------ LOAD KNOWLEDGE (THE VERCEL FIX) ------------------
// CRITICAL FIX: Use process.cwd() instead of __dirname for Vercel
const ragPath = path.join(process.cwd(), "rag", "visa_knowledge.txt");
let KNOWLEDGE_TEXT = "General visa rules and document requirements.";

try {
  if (fs.existsSync(ragPath)) {
    KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
    console.log("✅ Visa Knowledge Base Loaded");
  } else {
    console.warn(`⚠️ Warning: RAG file not found at: ${ragPath}`);
    console.warn("Using fallback knowledge base.");
  }
} catch (err) {
  console.error("❌ Error reading RAG file:", err);
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

// ------------------ AI CALL ------------------
async function callGroq(messages) {
  if (!process.env.GROQ_API_KEY) return "⚠️ API Key missing. Please check server logs.";

  try {
    const completion = await groq.chat.completions.create({
      model: CURRENT_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Groq API Error:", err);
    return "⚠️ The consultant is temporarily unavailable. Please try again.";
  }
}

// ------------------ MAIN HANDLER ------------------
async function handleChatMessage(req, res) {
  try {
    let { message, sessionId, userProfile, modelPrediction } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    if (!sessionId) sessionId = uuidv4();
    let history = chatHistories.get(sessionId) || [];

    const context = `
    User Profile: ${JSON.stringify(userProfile || {}, null, 2)}
    ML Prediction: ${JSON.stringify(modelPrediction || {}, null, 2)}
    Knowledge Base: ${KNOWLEDGE_TEXT.substring(0, 1500)}
    `;

    const messages = [
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "system", content: context },
      ...history.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    const botReply = await callGroq(messages);

    history.push({ role: "user", text: message });
    history.push({ role: "bot", text: botReply });
    if (history.length > 20) history = history.slice(-20);
    chatHistories.set(sessionId, history);

    res.json({ sessionId, response: botReply, history });
  } catch (error) {
    console.error("Handler Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ------------------ QUEUE SYSTEM ------------------
const queue = [];
let processing = false;

function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const { req, res } = queue.shift();
  handleChatMessage(req, res).finally(() => {
    processing = false;
    processQueue();
  });
}

app.post("/api/chat/message", (req, res) => {
  queue.push({ req, res });
  processQueue();
});

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => {
  res.send("VisaExpert AI Backend is Running 🟢");
});

// ------------------ VERCEL EXPORT ------------------
module.exports = app; // Required for Vercel

// ------------------ LOCAL DEV START ------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}