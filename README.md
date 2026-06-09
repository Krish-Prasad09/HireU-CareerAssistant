# AI Career

An AI-powered career assistant that helps users analyse resumes, match jobs, prep for interviews, and build polished resumes — all driven by Google Gemini.

> 🚀 **Deployment coming soon.** The app is currently running locally. A hosted version is in the pipeline.

---

## Features

- **Resume Analyser** — Upload a PDF resume and get structured AI feedback
- **Job Matcher** — Match yourself to relevant roles via manual skills input or resume upload
- **Interview Prep** — Generate round-specific interview questions (manual or resume-based)
- **Resume Builder** — Build a resume from scratch via a form, or improve an existing one with AI

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| `@react-oauth/google` | Google OAuth login |
| Axios | HTTP client |
| jsPDF | PDF export for generated resumes |
| react-hot-toast | Notifications |
| lucide-react | Icons |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| `@google/genai` (Gemini 2.5 Flash) | AI features |
| Google APIs / OAuth | Authentication |
| JSON Web Tokens | Session management |
| Razorpay *(wired, inactive)* | Payments (ready for activation) |
| dotenv | Environment config |

---

## Project Structure

```
aicareer/
├── ai-career-backend-master/
│   ├── src/
│   │   ├── config/         # DB, Google OAuth, AI prompts
│   │   ├── controllers/    # ai.ts, user.ts
│   │   ├── middlewares/    # isAuth.ts, trycatch.ts
│   │   ├── models/         # User.ts
│   │   ├── routes/         # ai.ts, user.ts
│   │   └── index.ts        # Express app entry
│   ├── dist/               # Compiled JS output
│   ├── .env
│   └── package.json
│
└── ai-career-frontend-master/
    ├── src/
    │   ├── components/     # Navbar, Footer, Pricing, Hero, etc.
    │   ├── context/        # AppContext (global state)
    │   ├── pages/          # Home, Login, Account, Analyse,
    │   │                   # JobMatcher, Interview, BuildResume
    │   ├── types.ts
    │   ├── utils.ts
    │   └── App.tsx
    └── package.json
```

---

## Running Locally

### Prerequisites
- Node.js ≥ 18
- A MongoDB URI (Atlas or local)
- A [Google Cloud project](https://console.cloud.google.com) with OAuth 2.0 credentials
- A [Google AI Studio](https://aistudio.google.com) Gemini API key

---

### 1. Backend

```bash
cd ai-career-backend-master
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_KEY_GEMINI=your_gemini_api_key
JWT_SEC=your_jwt_secret
```

Install and run:

```bash
npm install
npm run dev       # TypeScript watch + node --watch
# or
npm run build     # compile TS to dist/
npm start         # run compiled output
```

The server starts at `http://localhost:5000`.

---

### 2. Frontend

```bash
cd ai-career-frontend-master
```

Create a `.env` file (Vite exposes variables prefixed with `VITE_`):

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Install and run:

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

---

## API Routes

```
POST  /api/user/...          # Google OAuth login, profile
POST  /api/ai/analyse        # Resume analysis (PDF base64)
POST  /api/ai/jobmatcher     # Job matching (manual or PDF)
POST  /api/ai/interview      # Interview question generation
POST  /api/ai/buildresume    # Resume builder / improver
```

All `/api/ai/*` routes require a valid JWT (`Authorization: Bearer <token>`).

---

## User & Subscription Model

Users sign in with Google OAuth. Each user has:
- `freeRequestsUsed` — tracks free-tier usage
- `subscription` — date until Pro access is valid
- `hasProAccess()` — checks if subscription is still active
- `canMakeRequest()` — gate for all AI routes (currently open for testing)

Razorpay integration is wired in but commented out — ready to be enabled for monetisation.

---

## Deployment (Coming Soon)

Planned stack:
- **Backend** → [Render](https://render.com) (Node.js web service)
- **Frontend** → [Vercel](https://vercel.com) (Vite/React)
- **Database** → MongoDB Atlas (already configured)

Steps will be added here once live. You'll need to set the same environment variables in each platform's dashboard and update `VITE_BACKEND_URL` to point to the deployed backend URL.

---
