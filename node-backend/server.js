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
const whitelist = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://visa-verse-six.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (whitelist.includes(origin) || whitelist.includes("*")) {
        return callback(null, true);
      }

      console.warn(`❌ Blocked CORS request from ${origin}`);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

const FASTAPI_URL = "https://visaverse-backend-python.onrender.com"; // change to your actual render URL

setInterval(() => {
  axios.get(FASTAPI_URL)
    .then(() => console.log("🔥 Pinged FastAPI backend — kept alive"))
    .catch((err) => console.log("⚠️ FastAPI ping failed:", err.message));
}, 240000); // 4 minutes

// ------------------ CHAT MEMORY ------------------
const chatSessions = new Map();

// ------------------ KNOWLEDGE BASE ------------------
const BACKUP_KNOWLEDGE = `
GENERAL VISA RULES & DOCUMENTATION GUIDELINES:
1. FINANCIAL SUFFICIENCY: Applicants must prove 6 months of steady income.
2. TIES TO HOME: You must prove you will return.
3. CRIMINAL RECORDS: Requires PCC and rehabilitation proof.
4. TRAVEL HISTORY: Trusted-country travel helps.
5. COMMON REFUSAL REASONS: Low funds, vague itinerary, weak ties.
`;

let KNOWLEDGE_TEXT = BACKUP_KNOWLEDGE;

try {
  const ragPath = path.join(process.cwd(), "rag", "visa_knowledge.txt");

  if (fs.existsSync(ragPath)) {
    KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
    console.log("✅ Loaded RAG Knowledge Base");
  } else {
    console.warn("⚠️ RAG file missing — using fallback knowledge.");
  }
} catch (err) {
  console.error("❌ RAG file read error:", err.message);
}

// ------------------ SYSTEM MESSAGE ------------------
const SYSTEM_MESSAGE = `
You are "VisaExpert AI", a warm, friendly visa consultant.
Keep responses short, human-like, and strategic.
`;

// ------------------ AI CALL ------------------
async function callGroq(messages) {
  try {
    const completion = await groq.chat.completions.create({
      model: CURRENT_MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.6,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Groq API Error:", err);
    return "⚠️ The consultant is temporarily unavailable. Please try again.";
  }
}

// ------------------ MAIN MESSAGE HANDLER ------------------
async function handleChatMessage(req, res) {
  try {
    let { message, sessionId, userProfile, modelPrediction } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    // Session creation
    if (!sessionId || !chatSessions.has(sessionId)) {
      sessionId = sessionId || uuidv4();
      console.log("🆕 New Session:", sessionId);

      chatSessions.set(sessionId, {
        history: [],
        hasWarnedCriminal: false,
      });
    }

    const session = chatSessions.get(sessionId);
    let history = session.history;

    // Dynamic prompt
    let dynamicSystemPrompt = SYSTEM_MESSAGE;

    const isCriminal = userProfile && userProfile.criminal_record === 1;
    if (isCriminal) {
      if (!session.hasWarnedCriminal) {
        dynamicSystemPrompt += `
        🚨 CRITICAL: User has a CRIMINAL RECORD.
        Start reply with:
        "I see a critical flag regarding a criminal record. This is the main blocker."
        `;
        session.hasWarnedCriminal = true;
      }
    }

    const context = `
    User Profile: ${JSON.stringify(userProfile || {}, null, 2)}
    ML Prediction: ${JSON.stringify(modelPrediction || {}, null, 2)}
    Knowledge Base: ${KNOWLEDGE_TEXT.slice(0, 1500)}
    `;

    const messages = [
      { role: "system", content: dynamicSystemPrompt },
      { role: "system", content: context },
      ...history.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    const botReply = await callGroq(messages);

    // Save conversation
    history.push({ role: "user", text: message });
    history.push({ role: "bot", text: botReply });
    if (history.length > 20) history = history.slice(-20);

    session.history = history;
    chatSessions.set(sessionId, session);

    return res.json({ sessionId, response: botReply, history });
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
  res.send(
    `VisaExpert AI Backend Running 🟢  
     Knowledge Source: ${
       KNOWLEDGE_TEXT === BACKUP_KNOWLEDGE ? "Backup" : "RAG File"
     }`
  );
});

// ------------------ EXPORT FOR VERCEL ------------------
module.exports = app;

// ------------------ LOCAL DEV START ------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}
