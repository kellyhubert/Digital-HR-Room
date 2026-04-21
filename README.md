# Digital HR-Room

An AI-powered recruitment screening system that automates candidate evaluation using Google Gemini. Built for the **Umurava challenge**.

---

## Project Overview

Digital HR-Room streamlines the hiring pipeline by letting HR teams:

- Post jobs with configurable scoring weights (skills, experience, education, role relevance)
- Pull candidates from the **Umurava talent pool** or **upload external files** (CSV, Excel, PDF)
- Run AI-driven batch screening — every candidate receives a scored, evidence-based evaluation
- Generate role-specific **interview questions** with Gemini and automatically **evaluate answers**
- View a ranked shortlist with score breakdowns, identified strengths, gaps, and hiring recommendations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (port 3000)                        │
│               Next.js 16 · TypeScript · Tailwind CSS                │
│                                                                     │
│   ┌─────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│   │  Jobs / Post│  │  Screening View  │  │  Interview Module     │ │
│   └─────────────┘  └──────────────────┘  └───────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP (REST)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend API (port 3001)                        │
│              Node.js · Express 5 · TypeScript · Mongoose            │
│                                                                     │
│  Routes:                                                            │
│  POST /api/v1/jobs                  → create job                    │
│  POST /api/v1/jobs/:id/screen       → trigger AI screening          │
│  GET  /api/v1/jobs/:id/results      → fetch ranked results          │
│  POST /api/v1/jobs/:id/interview    → generate interview questions   │
│  POST /api/v1/interview-session     → evaluate candidate answers    │
│  GET  /api/v1/umurava/talents       → list Umurava talent pool      │
└───────────────┬──────────────────────────────┬──────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────────────────┐
│   MongoDB (port 27017)   │    │     AI Service (port 8000)           │
│                          │    │     Python · FastAPI · uvicorn       │
│  Collections:            │    │                                      │
│  - jobs                  │    │  POST /screen/                       │
│  - applicants            │    │  POST /interview/generate-questions  │
│  - screeningresults      │    │  POST /interview/evaluate            │
│  - interviewsessions     │    │  GET  /health                        │
└──────────────────────────┘    └──────────────┬───────────────────────┘
                                               │
                                               ▼
                                ┌──────────────────────────┐
                                │   Google Gemini API      │
                                │   gemini-2.0-flash       │
                                └──────────────────────────┘
```

---

## Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.10+ |
| MongoDB | 6+ (local or Atlas) |
| Google Gemini API Key | [Get one here](https://aistudio.google.com/app/apikey) |

---

### 1. Clone and install

```bash
git clone <repo-url>
cd "Digital HR-Room"
```

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

**AI Service**
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

---

### 2. Configure environment variables

See the [Environment Variables](#environment-variables) section below.

Copy the template and fill in your values:
```bash
# Root contains a full template:
cat .env.example
```

Create these three files:

| File | Service |
|------|---------|
| `backend/.env` | Node.js API |
| `ai-service/.env` | FastAPI AI Service |
| `frontend/.env.local` | Next.js Frontend |

---

### 3. Start services

**Quick start (Windows)**
```bat
start-ai-service.bat
start-backend.bat
start-frontend.bat
```

**Manual start**
```bash
# Terminal 1 — AI Service
cd ai-service && venv\Scripts\activate && uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**

---

## Environment Variables

### `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express server port |
| `NODE_ENV` | `development` | Runtime environment |
| `MONGODB_URI` | `mongodb://localhost:27017/digital-hr-room` | MongoDB connection string |
| `AI_SERVICE_URL` | `http://localhost:8000` | FastAPI AI service base URL |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded candidate files |
| `MAX_FILE_SIZE_MB` | `10` | Max upload size in MB |
| `UMURAVA_API_URL` | _(empty)_ | Umurava external API URL (optional) |
| `UMURAVA_API_KEY` | _(empty)_ | Umurava API key (optional) |

### `ai-service/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | **required** | Your Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model to use |
| `AI_SERVICE_PORT` | `8000` | FastAPI server port |

### `frontend/.env.local`

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | `Digital HR-Room` | Display name |

---

## AI Decision Flow

```
HR creates job posting
  │
  ├── Title, description, required/preferred skills
  ├── Minimum experience & education requirement
  └── Scoring weights (must sum to 100):
        skills | experience | education | role relevance

          │
          ▼
Candidates loaded
  ├── Source A: Umurava talent pool (15 mock profiles, filterable)
  └── Source B: External file upload (CSV / Excel / PDF parsed server-side)

          │
          ▼
Backend: screening.service.ts
  ├── Saves applicants to MongoDB
  ├── If candidates > 50 → splits into batches of 30
  │     (each batch screened independently, results merged & re-ranked)
  └── Calls AI Service via HTTP POST /screen/

          │
          ▼
AI Service: prompt_builder.py
  ├── Constructs a single structured prompt containing:
  │     • Full job posting block
  │     • Scoring weights (integers)
  │     • All candidate profiles (name, skills, experience, education, etc.)
  └── Appends strict JSON output schema

          │
          ▼
Gemini API (gemini-2.0-flash)
  ├── System instruction: "expert technical HR recruiter, impartial evaluator"
  ├── temperature = 0.2  (low randomness — consistent, deterministic scoring)
  ├── response_mime_type = "application/json"  (enforces JSON output)
  └── Returns evaluation array for ALL candidates

          │
          ▼
AI Service: response_parser.py
  ├── Strips any accidental markdown fences from response
  ├── Parses JSON; raises ValueError on malformed output
  ├── SERVER-SIDE score recomputation:
  │     overallScore = (skills × w_skills + experience × w_exp +
  │                     education × w_edu + relevance × w_rel) / 100
  │     (Gemini's own composite score is DISCARDED — arithmetic drift is real)
  ├── Clamps all scores to [0, 100]
  ├── Sorts by overallScore descending
  ├── Assigns sequential ranks (1 = best)
  └── Applies topN cutoff (max 50)

          │
          ▼
Backend stores ScreeningResult in MongoDB
  └── Status: pending → completed (or failed)

          │
          ▼
Frontend displays ranked shortlist
  └── Per candidate: rank, overall score, score breakdown bars,
        strengths, gaps, hiring recommendation, Gemini reasoning

          │
          ▼ (optional next step)
Interview round
  ├── Gemini generates role-specific questions for shortlisted candidates
  └── Candidate answers are evaluated and scored by Gemini
```

---

## Assumptions and Limitations

### Assumptions

- **Single-tenant**: The system has no user authentication or multi-tenant isolation. All jobs and candidates are globally visible. Suitable for demo / internal tooling use.
- **Synchronous screening is async internally**: The `/screen` endpoint returns immediately with a result ID; the actual Gemini call runs in a background async task. The frontend must poll for status.
- **Umurava talent pool is mocked**: The 15 profiles in `umurava.service.ts` are synthetic. The `UMURAVA_API_URL` and `UMURAVA_API_KEY` env vars are placeholders for a real integration.
- **Scoring weights are HR-configured**: The system trusts that weights provided by the HR user sum to 100. The AI service validates this and rejects requests where `|sum - 100| > 0.5`.
- **Candidate identity via email**: Deduplication uses email as the unique key per job. Candidates without an email in uploaded files get a generated placeholder address.

### Limitations

- **No resume parsing intelligence**: PDF/CSV parsing is structural (text extraction), not semantic. Poorly formatted resumes may produce incomplete candidate profiles.
- **Gemini API dependency**: All AI features require a valid `GEMINI_API_KEY` and active internet connection. There is no offline fallback.
- **Batch size ceiling**: Single-batch requests are capped at 30 candidates. Larger pools are chunked and results are merged, which may introduce minor inconsistencies in relative ranking across chunks (candidates in different chunks are not directly compared).
- **topN cap of 50**: The shortlist is limited to a maximum of 50 candidates per screening run.
- **No re-screening deduplication**: Triggering screening twice on the same job creates a new `ScreeningResult` document; previous results are not automatically archived or replaced.
- **Interview module is stateless**: Generated questions and evaluated answers are stored per session but there is no scoring aggregation across multiple interview sessions for the same candidate.
- **Windows-first scripts**: The provided `.bat` start scripts are Windows-only. Linux/macOS users must start services manually.
- **No production hardening**: CORS is open (`allow_origins=["*"]`), there is no rate limiting, and file uploads are stored on the local filesystem. Not suitable for production deployment without additional security measures.
