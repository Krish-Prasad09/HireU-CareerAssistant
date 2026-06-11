# HireU - Career Assistant

HireU is an AI-powered career assistant for resume analysis, job matching, interview preparation, and resume building. It combines a React/Vite frontend with a Node.js/Express API, MongoDB, Google OAuth, Gemini, and Razorpay-ready payment routes.

## Live Links

- Frontend: https://hire-u-career-assistant.vercel.app
- Backend API: https://hireu-careerassistant.onrender.com
- Health Check: https://hireu-careerassistant.onrender.com/health
- Repository: https://github.com/Krish-Prasad09/HireU-CareerAssistant

## What It Does

- Resume Analyser: upload a PDF resume and receive structured AI feedback.
- Job Matcher: compare resume or manual skills against suitable roles.
- Interview Prep: generate role-specific interview questions from input or resume data.
- Resume Builder: create, improve, export, and download resumes.
- LaTeX Export: generate editable LaTeX resume output.
- Google OAuth: sign in securely with Google.
- Credits and Payments: user credits, subscription fields, and Razorpay payment routes are wired.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| Routing | React Router v7 |
| Auth | Google OAuth, JWT |
| API | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| AI | Google Gemini via `@google/genai` |
| Payments | Razorpay |
| Deployment | Vercel frontend, Render backend |

## Architecture

```text
User Browser
    |
    v
Vercel Frontend
https://hire-u-career-assistant.vercel.app
    |
    | REST API requests
    v
Render Backend
https://hireu-careerassistant.onrender.com
    |
    +--> MongoDB Atlas
    +--> Google OAuth
    +--> Gemini API
    +--> Razorpay
```

## Project Structure

```text
aicareer/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- index.ts
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- .env.example
|   |-- vercel.json
|   |-- package.json
|   `-- vite.config.ts
|-- render.yaml
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 20 recommended.
- MongoDB URI from MongoDB Atlas or a local MongoDB instance.
- Google Cloud OAuth 2.0 client ID and client secret.
- Gemini API key from Google AI Studio.
- Razorpay key ID and key secret if testing payments.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
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

Backend runs at:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Frontend runs at:

```text
http://localhost:5173
```

## Production Environment

### Render Backend

The backend is deployed on Render.

Required Render environment variables:

```env
FRONTEND_URL=https://hire-u-career-assistant.vercel.app
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_KEY_GEMINI=your_gemini_api_key
JWT_SEC=your_long_random_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Render uses:

```text
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /health
```

### Vercel Frontend

The frontend is deployed on Vercel.

Required Vercel environment variables:

```env
VITE_API_URL=https://hireu-careerassistant.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Vercel uses:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

## Google OAuth Setup

In Google Cloud Console, add these Authorized JavaScript origins:

```text
http://localhost:5173
https://hire-u-career-assistant.vercel.app
```

The current auth flow uses `postmessage`, so no redirect URI is required unless the OAuth implementation changes.

## API Routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | API status |
| GET | `/health` | Render health check |
| POST | `/api/user/login` | Google OAuth login |
| GET | `/api/user/me` | Current user profile |
| GET | `/api/user/history` | User history |
| GET | `/api/review` | List reviews |
| POST | `/api/review` | Create review |
| POST | `/api/ai/analyse` | Resume analysis |
| POST | `/api/ai/jobmatcher` | Job matching |
| POST | `/api/ai/interview` | Interview question generation |
| POST | `/api/ai/buildresume` | Resume builder and improver |
| POST | `/api/ai/generate-latex` | LaTeX resume generation |
| POST | `/api/payment/checkout` | Razorpay order creation |
| POST | `/api/payment/verify` | Razorpay payment verification |
| GET | `/api/payment/status` | Credit and subscription status |

Protected routes require:

```text
Authorization: Bearer <token>
```

## Deployment Checklist

- Render backend is live at `https://hireu-careerassistant.onrender.com`.
- Vercel frontend is live at `https://hire-u-career-assistant.vercel.app`.
- `VITE_API_URL` points to the Render backend URL.
- `FRONTEND_URL` points to the Vercel frontend URL.
- Google OAuth contains the Vercel production origin.
- MongoDB Atlas allows connections from Render.
- Gemini and Razorpay keys are configured in Render.

## Build Commands

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

## Notes

- Render free instances may spin down after inactivity, so the first request after a cold start can be slow.
- `frontend/vercel.json` rewrites all frontend routes to `index.html`, which keeps React Router working on page refresh.
- Never commit real `.env` files or production secrets.
