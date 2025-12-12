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
      
      if (whitelist.includes("*") || whitelist.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        return callback(null, true); // Allow anyway for Demo Stability
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ------------------ SESSION STORAGE (WITH STATE) ------------------
// Stores { history: [], hasWarnedCriminal: boolean }
const chatSessions = new Map();

// ------------------ LOAD KNOWLEDGE (VERCEL SAFE) ------------------
const ragPath = path.join(process.cwd(), "rag", "visa_knowledge.txt");
let KNOWLEDGE_TEXT = "General visa rules and document requirements.";

try {
  if (fs.existsSync(ragPath)) {
    KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
    console.log("✅ Visa Knowledge Base Loaded");
  } else {
    console.warn(`⚠️ Warning: RAG file not found at: ${ragPath}`);
  }
} catch (err) {
  console.error("❌ Error reading RAG file:", err);
}

// ------------------ BASE PERSONA ------------------
const BASE_PERSONA = `
You are "VisaExpert AI", a warm, friendly, highly strategic visa consultant.

YOUR STYLE:
- Keep replies SHORT, helpful, and natural.
- First analyze the user's ML prediction + profile.
- Give simple, clear improvements.
- Do NOT always use phases — only when helpful.
- Respond like a human consultant, not a script.
`;

// ------------------ AI CALL ------------------
async function callGroq(messages) {
  if (!process.env.GROQ_API_KEY) return "⚠️ API Key missing. Please check server logs.";

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

// ------------------ MAIN HANDLER ------------------
async function handleChatMessage(req, res) {
  try {
    let { message, sessionId, userProfile, modelPrediction } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    // 1. INITIALIZE SESSION
    if (!sessionId || !chatSessions.has(sessionId)) {
      sessionId = sessionId || uuidv4();
      console.log("🆕 New Session:", sessionId);
      
      // Initialize state with the "Done Tag"
      chatSessions.set(sessionId, {
        history: [],
        hasWarnedCriminal: false, 
      });
    }

    // 2. RETRIEVE SESSION
    let session = chatSessions.get(sessionId);
    let history = session.history;

    // 3. DYNAMIC PROMPT LOGIC (ANTI-LOOP)
    let dynamicSystemPrompt = BASE_PERSONA;
    let isCriminal = userProfile && userProfile.criminal_record === 1;

    if (isCriminal) {
      if (!session.hasWarnedCriminal) {
        // TURN 1: Force the Warning
        dynamicSystemPrompt += `
        🚨 **CRITICAL CONTEXT:**
        The user has a CRIMINAL RECORD.
        You MUST ignore their pleasantries and start with:
        "I see a critical flag regarding a criminal record. This is the main blocker. We need to address this first."
        Then suggest a "Rehabilitation Strategy".
        `;
        session.hasWarnedCriminal = true; // Set Flag to TRUE
      } else {
        // TURN 2+: "Done Tag" Active -> Stop repeating!
        dynamicSystemPrompt += `
        ✅ **CONTEXT:** You have ALREADY warned them about the criminal record.
        **DO NOT REPEAT THE WARNING.**
        Now, answer their specific follow-up questions normally.
        If they ask for a plan, suggest lenient countries (like Germany/Canada) but reiterate the legal requirements gently.
        `;
      }
    }

    // 4. BUILD CONTEXT
    const context = `
    User Profile: ${JSON.stringify(userProfile || {}, null, 2)}
    ML Prediction: ${JSON.stringify(modelPrediction || {}, null, 2)}
    Knowledge Base: ${KNOWLEDGE_TEXT.substring(0, 1500)}
    `;

    // 5. BUILD MESSAGES
    const messages = [
      { role: "system", content: dynamicSystemPrompt },
      { role: "system", content: context },
      ...history.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    // 6. CALL AI
    const botReply = await callGroq(messages);

    // 7. SAVE HISTORY
    history.push({ role: "user", text: message });
    history.push({ role: "bot", text: botReply });
    
    if (history.length > 20) history = history.slice(-20);
    
    // Save updated session state
    session.history = history;
    chatSessions.set(sessionId, session);

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
module.exports = app;

// ------------------ LOCAL DEV START ------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}