# HireU - Career Assistant

HireU is an AI-powered career assistant that helps users analyse resumes, match jobs, prepare for interviews, and build polished resumes with LaTeX export. It uses a Vite/React frontend, an Express/TypeScript backend, MongoDB, Google OAuth, and Gemini.

## Features

- Resume Analyser: upload a PDF resume and get structured AI feedback.
- Job Matcher: match yourself to relevant roles using manual skills input or resume upload.
- Interview Prep: generate round-specific interview questions from manual input or a resume.
- Resume Builder: create a resume from a form, improve an existing resume with AI, and export LaTeX.
- Google OAuth login with JWT-backed authenticated API routes.
- Credit and subscription model with Razorpay routes wired for payments.

## Tech Stack

### Frontend

| Tech | Purpose |
| --- | --- |
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| `@react-oauth/google` | Google OAuth login |
| Axios | HTTP client |
| jsPDF | PDF export |
| lucide-react | Icons |

### Backend

| Tech | Purpose |
| --- | --- |
| Node.js + Express 5 | REST API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database and ODM |
| `@google/genai` | Gemini-powered AI features |
| Google APIs / OAuth | Authentication |
| JSON Web Tokens | Session management |
| Razorpay | Payment and credit routes |

## Project Structure

```text
aicareer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.ts
├── render.yaml
└── README.md
```

## Running Locally

### Prerequisites

- Node.js 20 recommended.
- MongoDB URI from MongoDB Atlas or a local MongoDB server.
- Google Cloud OAuth 2.0 web client.
- Gemini API key from Google AI Studio.
- Razorpay key ID and key secret if payment routes are enabled.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Update `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_KEY_GEMINI=your_gemini_api_key
JWT_SEC=your_long_random_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

The API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

The app runs at `http://localhost:5173`.

## Production Deployment

The repo is configured for this deployment split:

- Backend API: Render web service using `render.yaml`.
- Frontend app: Vercel Vite deployment using `frontend/vercel.json`.
- Database: MongoDB Atlas.

### 1. Push the Code to GitHub

Make sure the latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare HireU for deployment"
git push origin main
```

### 2. Deploy the Backend on Render

1. Open [Render](https://render.com).
2. Choose **New +** then **Blueprint**.
3. Connect this GitHub repository.
4. Render will detect `render.yaml` and create the `hireu-career-assistant-api` web service.
5. Add these environment variables in Render:

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_KEY_GEMINI=your_gemini_api_key
JWT_SEC=your_long_random_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Render will provide a backend URL like:

```text
https://hireu-career-assistant-api.onrender.com
```

Confirm it is live by opening:

```text
https://your-render-service-url.onrender.com/health
```

### 3. Deploy the Frontend on Vercel

1. Open [Vercel](https://vercel.com).
2. Import the same GitHub repository.
3. Set the project root directory to `frontend`.
4. Use these build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

5. Add these environment variables in Vercel:

```env
VITE_API_URL=https://your-render-service-url.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

6. Deploy the project.

### 4. Update Google OAuth

In Google Cloud Console, update the OAuth client used by the app:

- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `https://your-vercel-app.vercel.app`
- Authorized redirect URIs are not required for the current `postmessage` OAuth flow.

### 5. Final Production Checks

- Open the Vercel URL.
- Sign in with Google.
- Test resume analysis, job matching, interview prep, and resume builder.
- Check Render logs if any API request fails.
- Keep Render and Vercel environment variables in sync if keys change.

## API Routes

```text
GET   /                         # API status
GET   /health                   # Render health check
POST  /api/user/login           # Google OAuth login
GET   /api/user/me              # Current user profile
GET   /api/user/history         # User history
GET   /api/review               # Reviews
POST  /api/review               # Create review
POST  /api/ai/analyse           # Resume analysis
POST  /api/ai/jobmatcher        # Job matching
POST  /api/ai/interview         # Interview question generation
POST  /api/ai/buildresume       # Resume builder / improver
POST  /api/ai/generate-latex    # LaTeX resume generation
POST  /api/payment/checkout     # Razorpay order
POST  /api/payment/verify       # Razorpay verification
GET   /api/payment/status       # Credit/subscription status
```

AI and payment routes require:

```text
Authorization: Bearer <token>
```

## LaTeX Resume Generator

The resume builder can export an editable `.tex` file based on form data.

- Converts resume form data directly to LaTeX.
- Uses an IIT Indore-style resume template.
- Includes personal details, education, experience, projects, and skills.
- Can be compiled locally with MiKTeX or TeX Live, or online with Overleaf.

## Deployment Notes

- `VITE_API_URL` must point to the deployed backend URL in production.
- `VITE_GOOGLE_CLIENT_ID` must match the Google OAuth client configured for the deployed frontend domain.
- Render sets `PORT` automatically; local development falls back to `5000`.
- The backend exposes `/health` for Render health checks.
- `frontend/vercel.json` rewrites all routes to `index.html` so direct navigation works with React Router.
