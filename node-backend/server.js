// ------------------ IMPORTS ------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Groq = require("groq-sdk");

dotenv.config();

// ------------------ EXPRESS APP ------------------
const app = express();

// ------------------ GROQ SETUP ------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Best stable model on Groq
const CURRENT_MODEL = "llama-3.3-70b-versatile";

// ------------------ MIDDLEWARE ------------------
const whitelist = [
  process.env.CLIENT_URL, // http://localhost:5173
  "http://localhost:5173", // Fallback for Vite
  "http://localhost:3000", // Fallback for Create React App
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      
      if (whitelist.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin); // Debugging log
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allows cookies/headers to be sent
  })
);
app.use(express.json());

// ------------------ CHAT MEMORY ------------------
const chatHistories = new Map();

// ------------------ LOAD KNOWLEDGE ------------------
const ragPath = path.join(__dirname, "rag", "visa_knowledge.txt");
let KNOWLEDGE_TEXT = "General visa rules and document requirements.";

if (fs.existsSync(ragPath)) {
  KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
  console.log("✅ Visa Knowledge Loaded");
} else {
  console.log("⚠️ Missing rag/visa_knowledge.txt");
}

// ------------------ SYSTEM MESSAGE ------------------
const SYSTEM_MESSAGE = `
You are "VisaExpert AI", a warm, friendly, strategic visa consultant.
- Keep replies short, helpful, and clear.
- Use the user's ML prediction + profile.
- Focus on the MAIN reason affecting approval.
- Give 2–3 practical fixes.
- Avoid robotic template replies.
`;

// ------------------ AI CALL ------------------
async function callGroq(messages) {
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
    return "⚠️ The consultant is temporarily unavailable. Please try again.";
  }
}

// ------------------ MAIN CHAT HANDLER ------------------
async function handleChatMessage(req, res) {
  let { message, sessionId, userProfile, modelPrediction } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  // Start or load session
  if (!sessionId) sessionId = uuidv4();
  let history = chatHistories.get(sessionId) || [];

  // Build knowledge context
  const context = `
User Profile:
${JSON.stringify(userProfile || {}, null, 2)}

ML Prediction:
${JSON.stringify(modelPrediction || {}, null, 2)}

Knowledge Base:
${KNOWLEDGE_TEXT.substring(0, 1500)}
`;

  // Construct message array
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

  // Save memory (limit to last 10 messages)
  history.push({ role: "user", text: message });
  history.push({ role: "bot", text: botReply });
  if (history.length > 20) history = history.slice(-20);
  chatHistories.set(sessionId, history);

  res.json({
    sessionId,
    response: botReply,
    history,
  });
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
  res.send("VisaExpert AI backend running.");
});

// ------------------ EXPORT FOR VERCEL ------------------
module.exports = app;

// ------------------ LOCAL DEVELOPMENT MODE ------------------
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
    console.log(`⚡ Using Groq model: ${CURRENT_MODEL}`);
  });
}
