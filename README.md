# HireU - CareerAI 

An AI-powered resume analysis and career development platform that helps users analyse resumes, match jobs, prep for interviews, and build polished resumes — all driven by Google Gemini API.

> 🚀 **Live Features**: Resume analysis, job matching, interview prep, and resume builder with LaTeX export. Deployment coming soon.

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
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Google OAuth, AI prompts
│   │   ├── controllers/    # ai.ts, user.ts
│   │   ├── middlewares/    # isAuth.ts, trycatch.ts
│   │   ├── models/         # User.ts
│   │   ├── routes/         # ai.ts, user.ts
│   │   └── index.ts        # Express app entry
│   ├── dist/               # Compiled JS output
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Footer, Pricing, Hero, etc.
    │   ├── context/        # AppContext (global state)
    │   ├── pages/          # Home, Login, Account, Analyse,
    │   │                   # JobMatcher, Interview, BuildResume
    │   ├── types.ts
    │   ├── utils.ts
    │   └── App.tsx
    ├── public/             # Static assets
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── eslint.config.js
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
cd backend
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
cd frontend
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

## LaTeX Resume Generator (IIT Indore Format)

The app includes a **LaTeX Resume Generator** that exports resumes in the official IIT Indore format. The LaTeX is generated **directly from your form data** (not AI-generated), perfect for compiling locally or on Overleaf.

### Features
- **Direct Form-to-LaTeX** — Converts your BuildResume form data directly to LaTeX (no AI involved)
- **IIT Indore Template** — Professional resume template based on IIT Indore's official LaTeX format
- **One-Click Export** — Download your resume as a `.tex` file ready for compilation in Overleaf or locally
- **Custom LaTeX Sections** — Includes:
  - Personal details (name, phone, email, LinkedIn)
  - Education table with CGPA and year
  - Experience section with bullet points
  - Projects section with links
  - Technical and soft skills
- **Fully Customizable** — Edit the LaTeX source code to:
  - Add your photo
  - Change margins, fonts, or colors
  - Add additional sections (positions, achievements, etc.)
  - Adjust any styling

### How to Use
1. Fill out the **Resume Builder** form with your details
2. Click **"Download LaTeX"** button (next to PDF download)
3. **Option A** — Save the `.tex` file and compile locally with MiKTeX, TeX Live, or similar
4. **Option B** — Open in [Overleaf](https://www.overleaf.com) and compile online
5. Update placeholder paths (e.g., `Your_Photo.jpg`, `IITI Logo - Refined.jpg`)
6. Export as PDF from your LaTeX editor

### LaTeX Output Details
- **File Format** — `.tex` (plain text, fully editable)
- **License** — MIT
- **Packages Included** — Full LaTeX preamble with all necessary packages (graphicx, hyperref, tabularx, etc.)
- **Template Structure** — Custom commands for resume sections (`\resumeSubheading`, `\resumeProject`, etc.)
- **Ready to Compile** — Can be compiled immediately to PDF without modifications (if you add images)

---

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
