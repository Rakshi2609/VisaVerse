# VisaVerse Frontend (React + Vite)

Immigration assistant UI built with React 19, Vite, Tailwind v4, framer-motion, and lucide-react icons. Pages:
- Home: marketing hero, CTA cards, process steps.
- Predict: form-driven visa assessment calling the FastAPI scorer.
- Assistant: chat experience backed by the Groq-powered Node API; pre-seeds with the last prediction stored locally.

## Scripts
- `npm run dev` — local dev server.
- `npm run build` — production build.
- `npm run preview` — preview built assets.
- `npm run lint` — ESLint (config in eslint.config.js).

## Environment Variables
Create a `.env` or `.env.local`:
- `VITE_ML_API` — base URL of the FastAPI scorer (e.g., http://localhost:10000).
- `VITE_BACKEND_URL` — base URL of the Groq chat API (e.g., http://localhost:5000).

## Local Setup
```
npm install
VITE_ML_API=http://localhost:10000 VITE_BACKEND_URL=http://localhost:5000 npm run dev
```
Frontend defaults to port 5173.

## Build Output
Static assets emitted to `dist/`; deploy behind any static host. Ensure CORS is configured on both APIs for the deployed origin.
