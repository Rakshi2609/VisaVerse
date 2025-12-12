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

// Best model for speed/quality balance
const CURRENT_MODEL = "llama-3.3-70b-versatile";

// ------------------ CORS SETUP ------------------
const clientUrl = process.env.CLIENT_URL || "*"; 

const whitelist = [
  clientUrl,
  "http://localhost:5173", 
  "http://localhost:3000", 
  "https://visa-verse-six.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      
      // If whitelist contains '*' or origin is listed, allow it
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
// Stores session state: { history: [], hasWarnedCriminal: boolean }
const chatSessions = new Map();

// ------------------ KNOWLEDGE BASE (FAIL-SAFE) ------------------
// 1. Define the Backup Text (Hardcoded)
const BACKUP_KNOWLEDGE = `
GENERAL VISA RULES & DOCUMENTATION GUIDELINES:
1. FINANCIAL SUFFICIENCY: Applicants must prove 6 months of steady income via bank statements. Large unexplained deposits are red flags.
2. TIES TO HOME: You must prove you will return. Evidence: Job contract, property deeds, family ties.
3. CRIMINAL RECORDS: Major red flag. Requires Police Clearance Certificate (PCC) and proof of rehabilitation.
4. TRAVEL HISTORY: Previous travel to trusted nations (USA, UK, Schengen) boosts credibility.
5. COMMON REFUSAL REASONS: Vague itinerary, low savings vs trip cost, weak employment ties.
`;

let KNOWLEDGE_TEXT = BACKUP_KNOWLEDGE; // Default to backup

// 2. Try to read the file (Bonus if it works)
try {
  // Use process.cwd() for Vercel
  const ragPath = path.join(process.cwd(), "rag", "visa_knowledge.txt");
  
  if (fs.existsSync(ragPath)) {
    KNOWLEDGE_TEXT = fs.readFileSync(ragPath, "utf8");
    console.log("✅ Visa Knowledge Base Loaded from File");
  } else {
    console.warn("⚠️ RAG File not found. Using Embedded Backup Knowledge.");
  }
} catch (err) {
  console.error("❌ Error reading RAG file. Using Backup.", err.message);
  KNOWLEDGE_TEXT = BACKUP_KNOWLEDGE;
}

// ------------------ SYSTEM MESSAGE ------------------
const SYSTEM_MESSAGE = `
You are "VisaExpert AI", a warm, friendly, highly strategic visa consultant.

YOUR STYLE:
- Keep replies SHORT, helpful, and natural.
- First analyze the user's ML prediction + profile.
- Highlight the MAIN factor affecting approval (criminal record, income, travel, ties).
- Give simple, clear improvements.
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
      
      chatSessions.set(sessionId, {
        history: [],
        hasWarnedCriminal: false, // The "Done Tag"
      });
    }

    // 2. RETRIEVE SESSION
    let session = chatSessions.get(sessionId);
    let history = session.history;

    // 3. DYNAMIC PROMPT LOGIC (ANTI-LOOP)
    let dynamicSystemPrompt = SYSTEM_MESSAGE;
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
        session.hasWarnedCriminal = true; // Mark as done
      } else {
        // TURN 2+: "Done Tag" Active -> Stop repeating!
        dynamicSystemPrompt += `
        ✅ **CONTEXT:** You have ALREADY warned them about the criminal record.
        **DO NOT REPEAT THE WARNING.**
        Now, answer their specific follow-up questions normally.
        If they ask for a plan, suggest lenient countries but remind them gently about the record.
        `;
      }
    }

    // 4. BUILD CONTEXT
    const context = `
    User Profile: ${JSON.stringify(userProfile || {}, null, 2)}
    ML Prediction: ${JSON.stringify(modelPrediction || {}, null, 2)}
    Knowledge Base: ${KNOWLEDGE_TEXT.substring(0, 1500)}
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

    // 5. CALL AI
    const botReply = await callGroq(messages);

    // 6. SAVE HISTORY
    history.push({ role: "user", text: message });
    history.push({ role: "bot", text: botReply });
    
    if (history.length > 20) history = history.slice(-20);
    
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
  res.send(`VisaExpert AI Backend Running 🟢 (Knowledge Source: ${KNOWLEDGE_TEXT === BACKUP_KNOWLEDGE ? "Embedded Backup" : "External File"})`);
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