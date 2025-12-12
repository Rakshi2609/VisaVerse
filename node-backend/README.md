# VisaVerse Node Assistant API

Express service that powers the VisaExpert AI chat, orchestrating Groq LLM responses with optional user profile and ML prediction context.

## Setup
1. Install dependencies:
```
npm install
```
2. Environment variables (required/optional):
- `GROQ_API_KEY` (required) — API key for Groq.
- `CLIENT_URL` (optional) — allowed origin for CORS; defaults include localhost and production URL.
- `PORT` (optional) — default 5000.

3. Run locally:
```
GROQ_API_KEY=your_key CLIENT_URL=http://localhost:5173 PORT=5000 npm start
```

## Endpoints
- `GET /` — health text indicating whether RAG file loaded.
- `POST /api/chat/message` — body fields:
```
{
  "message": "How do I strengthen my case?",   // required
  "sessionId": "uuid-optional",                // reuse to maintain history
  "userProfile": { ... },                       // optional; last form data from frontend
  "modelPrediction": { ... }                    // optional; last ML prediction from frontend
}
```
Response includes `sessionId`, `response` (LLM text), and updated `history` array. Requests are queued to avoid concurrent Groq calls.

## RAG and Knowledge Base
- Tries to load `rag/visa_knowledge.txt`; falls back to baked-in guidance if missing.
- System prompt: warm, concise visa consultant tone.

## FastAPI Keep-Alive
- Periodically pings the Python scorer at `https://visaverse-backend-python.onrender.com` to keep it warm; adjust `FASTAPI_URL` constant in `server.js` if needed.

## Deployment
- `vercel.json` provided for serverless deployment; set `GROQ_API_KEY` and `CLIENT_URL` in the platform env vars.
- CORS whitelist includes localhost, deployed frontend URL, and `CLIENT_URL`.
