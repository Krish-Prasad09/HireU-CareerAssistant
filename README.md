<div align="center">

# 🎓 HireU — AI Career Assistant

**Resume analysis · Job matching · Interview prep · Resume builder**  
From PDF to polished LaTeX resume — powered by Gemini AI.

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-000000?style=for-the-badge&logo=vercel)](https://hire-u-career-assistant.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=111111)](https://hireu-careerassistant.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=ffffff)](https://www.mongodb.com/atlas)

**→ [hire-u-career-assistant.vercel.app](https://hire-u-career-assistant.vercel.app)**

</div>

---

## What is HireU?

HireU is a full-stack AI career assistant that walks users through the entire job preparation workflow in one place — upload a resume, get a detailed ATS analysis, match it against relevant roles, generate interview questions tailored to the position, and rebuild the resume with AI suggestions. Everything exports cleanly to LaTeX for Overleaf.

> **Demo & screenshots** — _coming soon_

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 📄 | **Resume Analyser** | Upload a PDF resume and receive a structured ATS score with breakdowns across formatting, keywords, structure, and readability — plus prioritised fix suggestions. |
| 🎯 | **Job Matcher** | Compare your resume or skill set against real career roles; get ranked match scores and tailored apply tips. |
| 🎙️ | **Interview Prep** | Generate role-specific and round-specific interview questions with hint frameworks. |
| 🧱 | **Resume Builder** | Describe your experience, get AI-enhanced bullet points, and iterate on a polished resume interactively. |
| 📜 | **LaTeX Export** | One-click export to a clean IIT-style LaTeX template, ready to compile on Overleaf or locally. |
| 🔐 | **Google OAuth** | Secure sign-in via Google with JWT session management. |
| 🪙 | **Credit System** | 10 free requests on signup. Top up with paid credit packs via Razorpay (test mode; live payments coming soon). |

<details>
<summary><strong>🧠 AI request pipeline</strong></summary>

```
User input / PDF
      │
      ▼
Frontend form (React)
      │
      ▼
Express API  ──►  Auth + credit check
                        │
                        ▼
               Gemini prompt pipeline
                        │
                        ▼
            Structured JSON response
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ATS Analysis   Job Match    Interview Qs
                                      │
                                      ▼
                             Resume Builder / LaTeX
```

</details>

---

## Architecture

```
                         ┌─────────────────────────────────┐
                         │             👤 User              │
                         └────────────────┬────────────────┘
                                          │  HTTPS
                                          ▼
                    ┌─────────────────────────────────────────┐
                    │         ⚛️  Vercel  (Frontend)           │
                    │   hire-u-career-assistant.vercel.app     │
                    │   React 19 · TypeScript · Tailwind v4    │
                    └──────────────────┬──────────────────────┘
                                       │  REST / JSON
                                       ▼
                    ┌─────────────────────────────────────────┐
                    │         🚀  Render  (Backend)            │
                    │    hireu-careerassistant.onrender.com    │
                    │    Express 5 · TypeScript · JWT Auth     │
                    └────┬──────────┬──────────┬──────────────┘
                         │          │          │
              ┌──────────┘   ┌──────┘   ┌─────┘
              ▼              ▼          ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ 🍃 MongoDB   │  │ 🤖 Gemini    │  │ 🔐 Google    │  │ 💳 Razorpay  │
   │    Atlas     │  │  2.5 Flash   │  │   OAuth 2.0  │  │  (test mode) │
   │  User data   │  │  AI engine   │  │  Sign-in     │  │  Payments    │
   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

> **Note:** The Render free tier spins down after inactivity. The first request after a cold start may take 10–30 seconds.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Auth | Google OAuth 2.0, JWT |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini 2.5 Flash via `@google/genai` |
| Payments | Razorpay (test mode) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
HireU/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # Mongoose connection to MongoDB Atlas (dbName: "ai-career")
│   │   │   ├── googleconfig.ts    # Google OAuth 2.0 client setup
│   │   │   └── prompt.ts          # Gemini prompt templates for all 4 AI features
│   │   │
│   │   ├── controllers/
│   │   │   ├── ai.ts              # analyseResume, jobMatcher, interviewPrep, buildResume, generateLatex
│   │   │   ├── payment.ts         # Razorpay checkout order creation + signature verification
│   │   │   ├── review.ts          # Public review CRUD
│   │   │   └── user.ts            # Google login handler, /me, /history
│   │   │
│   │   ├── middlewares/
│   │   │   ├── isAuth.ts          # JWT Bearer token verification; attaches req.user
│   │   │   └── trycatch.ts        # Async error-handler wrapper for all controllers
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts            # User schema: freeRequestsUsed, paidCredits, subscription,
│   │   │   │                      #   history[]; methods: hasProAccess(), canMakeRequest()
│   │   │   └── Review.ts          # Review schema: rating, comment, userName, userImage
│   │   │
│   │   ├── routes/
│   │   │   ├── ai.ts              # POST /api/ai/{analyse,jobmatcher,interview,buildresume,generate-latex}
│   │   │   ├── payment.ts         # POST /api/payment/{checkout,verify}  GET /api/payment/status
│   │   │   ├── review.ts          # GET/POST /api/review
│   │   │   └── user.ts            # POST /api/user/login  GET /api/user/{me,history}
│   │   │
│   │   ├── services/
│   │   │   └── latexGenerator.ts  # Builds IIT-style LaTeX resume string from structured IITResumeData
│   │   │
│   │   └── index.ts               # Express app bootstrap, CORS, routes mount, /health endpoint
│   │
│   ├── dist/                      # Compiled JS output (tsc build artifact, not committed)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing page (hero, features, pricing, reviews)
│   │   │   ├── Login.tsx          # Google OAuth sign-in page
│   │   │   ├── Analyse.tsx        # Resume Analyser — PDF upload → ATS score + suggestions
│   │   │   ├── JobMatcher.tsx     # Job Matcher — skills/resume → ranked role matches
│   │   │   ├── Interview.tsx      # Interview Prep — role + round → question bank
│   │   │   ├── BuildResume.tsx    # Resume Builder — form → AI bullets → LaTeX export
│   │   │   └── Account.tsx        # User profile, credit balance, usage history
│   │   │
│   │   ├── components/
│   │   │   ├── CreditGate.tsx     # Modal shown when free requests exhausted; triggers Razorpay
│   │   │   ├── ProtectedRoutes.tsx # Redirects unauthenticated users to /login
│   │   │   ├── PublicRoutes.tsx   # Redirects authenticated users away from /login
│   │   │   ├── navbar.tsx         # Top navigation with credit counter
│   │   │   ├── hero.tsx           # Landing hero section
│   │   │   ├── features.tsx       # Feature cards grid
│   │   │   ├── pricing.tsx        # Pricing / credit pack section
│   │   │   ├── reviews.tsx        # Community reviews carousel
│   │   │   ├── ctabanner.tsx      # Call-to-action banner
│   │   │   ├── footer.tsx
│   │   │   └── loading.tsx        # Full-screen spinner
│   │   │
│   │   ├── context/
│   │   │   └── AppContext.tsx     # Global state: user, isAuth, fetchUser(), LogoutUser()
│   │   │
│   │   ├── types.ts               # All shared TS interfaces (User, Analysis, Job, ResumeData,
│   │   │                          #   IITResumeData, HistoryEntry, etc.)
│   │   ├── utils.ts               # Helpers: toBase64, scoreColor, prioBg, downloadReport
│   │   ├── ring.tsx               # Animated ring component used in hero
│   │   ├── App.tsx                # React Router route definitions
│   │   ├── main.tsx               # Vite entry; exports `server` base URL constant
│   │   └── index.css              # Tailwind base + custom glass-card / btn-primary classes
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── google.svg             # Used in Google sign-in button
│   │   ├── icons.svg              # Sprite sheet for feature icons
│   │   └── user.png               # Default avatar fallback
│   │
│   ├── vercel.json                # SPA rewrite: all routes → index.html
│   ├── vite.config.ts
│   └── package.json
│
├── render.yaml                    # Render deployment config (build + start commands)
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB URI (Atlas or local)
- Google Cloud OAuth 2.0 credentials
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Razorpay test keys (optional, only needed if testing payment flow)

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5000
```

`backend/.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_KEY_GEMINI=your_gemini_api_key
JWT_SEC=your_long_random_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5173
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Google OAuth (local)

Add `http://localhost:5173` as an **Authorized JavaScript origin** in your Google Cloud Console OAuth client. No redirect URI needed — the app uses the `postmessage` flow.

---

## Production Setup

### Render (backend)

```env
FRONTEND_URL=https://hire-u-career-assistant.vercel.app
MONGO_URI=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
API_KEY_GEMINI=...
JWT_SEC=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

| Setting | Value |
|---------|-------|
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

### Vercel (frontend)

```env
VITE_API_URL=https://hireu-careerassistant.onrender.com
VITE_GOOGLE_CLIENT_ID=...
```

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Google OAuth (production)

Add `https://hire-u-career-assistant.vercel.app` as an **Authorized JavaScript origin** alongside your localhost entry.

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | API status | — |
| GET | `/health` | Render health check | — |
| POST | `/api/user/login` | Google OAuth login / register | — |
| GET | `/api/user/me` | Current user profile + credit status | ✓ |
| GET | `/api/user/history` | Usage history (last 100 entries) | ✓ |
| GET | `/api/review` | List public reviews | — |
| POST | `/api/review` | Submit a review | ✓ |
| POST | `/api/ai/analyse` | Resume analysis (PDF base64) | ✓ |
| POST | `/api/ai/jobmatcher` | Job role matching | ✓ |
| POST | `/api/ai/interview` | Interview question generation | ✓ |
| POST | `/api/ai/buildresume` | Resume builder / bullet enhancer | ✓ |
| POST | `/api/ai/generate-latex` | LaTeX resume generation | ✓ |
| POST | `/api/payment/checkout` | Razorpay order creation | ✓ |
| POST | `/api/payment/verify` | Razorpay payment verification | ✓ |
| GET | `/api/payment/status` | Credit + subscription status | ✓ |

---

## Credit System

| Tier | Requests | How |
|------|---------|-----|
| Free | 10 requests | Granted on first login |
| Paid credits | 40 credits for ₹29 | One-time Razorpay purchase (test mode) |
| Pro | Unlimited | Subscription-based (coming soon) |

Deduction order: free requests first → paid credits → Pro users bypass all checks.

---

## Build Commands

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm run preview
```

---

## Future Improvements

- Add screenshots and a short demo GIF.
- Activate Razorpay live keys to enable real payments (currently test mode).
- Add richer subscription and billing history UI.

---

## Notes

- Never commit `.env` files or production secrets to the repository.
- MongoDB Atlas requires your deployment IP to be whitelisted. On Render's free tier, IPs change on restart — use **Allow access from anywhere** (`0.0.0.0/0`) or set up a static IP add-on.
- The `@google/genai` SDK is used for all four AI features with `gemini-2.5-flash` as the model.
- `frontend/vercel.json` rewrites all routes to `index.html` so React Router works on hard refresh.