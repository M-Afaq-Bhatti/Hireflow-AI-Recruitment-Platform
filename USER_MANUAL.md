# HireFlow — Complete User Manual

> **Who this is for:** Anyone setting up, running, or using HireFlow — no deep technical knowledge needed.

---

## Table of Contents

1. [What is HireFlow?](#what-is-hireflow)
2. [How the Full Pipeline Works](#how-the-full-pipeline-works)
3. [Project Folder Structure](#project-folder-structure)
4. [Prerequisites — What to Install](#prerequisites)
5. [Step-by-Step Setup Guide](#setup-guide)
6. [How to Run the Project](#how-to-run)
7. [Using HireFlow — HR Guide](#using-hireflow)
8. [The Candidate Experience](#candidate-experience)
9. [Environment Variables Explained](#environment-variables)
10. [Troubleshooting](#troubleshooting)
11. [Tech Stack Summary](#tech-stack)

---

## What is HireFlow?

HireFlow is an **autonomous AI recruitment platform**. When a company posts a job and a candidate applies, four AI agents automatically take over:

| Agent | Job |
|---|---|
| Agent 1 — Screener | Reads the resume, scores it against the job description |
| Agent 2 — Assessor | Generates a custom skill test, emails it to the candidate |
| Agent 3 — Evaluator | Grades the submitted answers, writes a report |
| Agent 4 — Interviewer | Sends a voice interview link, conducts the AI interview |

HR staff only need to look at the final results and decide who to hire. The entire process — from application to interview-ready — takes about **3 minutes**.

---

## How the Full Pipeline Works

```
Candidate fills apply form  (/apply/[jobId])
           │
           ▼
  Backend saves resume (encrypted)
           │
           ▼
  Kafka topic: resume-submitted
           │
           ▼
  ┌─── Agent 1 ───────────────────────┐
  │ Reads resume + job description    │
  │ Calls Groq AI → score 0-100       │
  │ score ≥ 60 → qualified            │
  └───────────────────────────────────┘
           │ qualified?
     YES ──┤──────────────────── NO → stage = SCREENED_OUT
           ▼
  Kafka topic: screening-passed
           │
           ▼
  ┌─── Agent 2 ───────────────────────┐
  │ Generates 5 role-specific Qs      │
  │ Saves assessment to DB            │
  │ Emails link to candidate          │
  └───────────────────────────────────┘
           │
           ▼  (candidate clicks email link, answers test)
  Candidate submits answers  (/assessment/[token])
           │
           ▼
  Kafka topic: assessment-submitted
           │
           ▼
  ┌─── Agent 3 ───────────────────────┐
  │ Grades all answers with Groq AI   │
  │ Writes evaluation report          │
  │ score ≥ 50 → shortlisted          │
  └───────────────────────────────────┘
           │ shortlisted?
     YES ──┤──────────────────── NO → stage = REJECTED
           ▼
  Kafka topic: interview-invited
           │
           ▼
  ┌─── Agent 4 ───────────────────────┐
  │ Generates signed interview token  │
  │ Stores in Redis (24h TTL)         │
  │ Emails interview link             │
  └───────────────────────────────────┘
           │
           ▼  (candidate clicks email link)
  AI Voice Interview  (/interview/[token])
  Browser mic + Web Speech API
           │
           ▼
  HR Dashboard shows result
  HR makes final decision
```

**Throughout the pipeline**, Socket.io pushes live updates to the HR dashboard. Every time a candidate moves to a new stage, their card on the Kanban board updates instantly — no page refresh needed.

---

## Project Folder Structure

```
hireflow/
├── docker-compose.yml          ← starts Postgres, Redis, Kafka
├── .env.example                ← copy this to backend/.env
│
├── backend/                    ← Node.js + Express server
│   ├── server.js               ← entry point
│   ├── .env                    ← your actual secrets (never commit this)
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma       ← database table definitions
│   ├── uploads/                ← encrypted resume files stored here
│   └── src/
│       ├── routes/             ← REST API endpoints
│       │   ├── auth.routes.js
│       │   ├── job.routes.js
│       │   ├── candidate.routes.js
│       │   ├── assessment.routes.js
│       │   ├── interview.routes.js
│       │   └── tenant.routes.js
│       ├── middleware/
│       │   ├── auth.middleware.js    ← JWT verification
│       │   └── upload.middleware.js  ← file upload handling
│       ├── agents/             ← the 4 AI agents
│       │   ├── agent1.screener.js
│       │   ├── agent2.assessor.js
│       │   ├── agent3.evaluator.js
│       │   ├── agent4.interviewer.js
│       │   └── prompts.js      ← all AI prompt templates
│       ├── kafka/
│       │   ├── producer.js     ← publishes messages
│       │   ├── consumer.js     ← wires agents to topics
│       │   └── topics.js       ← topic name constants
│       ├── sockets/
│       │   ├── socket.server.js     ← Socket.io init
│       │   └── dashboard.socket.js  ← live dashboard emitters
│       └── services/
│           ├── groq.service.js      ← Groq AI API wrapper
│           ├── redis.service.js     ← cache operations
│           ├── email.service.js     ← sends emails
│           ├── crypto.service.js    ← AES-256 encryption
│           └── token.service.js     ← JWT sign/verify
│
└── frontend/                   ← Next.js 14 app
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── .env.local
    └── src/
        ├── app/
        │   ├── page.tsx              ← landing page
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   ├── dashboard/
        │   │   ├── layout.tsx        ← sidebar nav
        │   │   └── page.tsx          ← Kanban pipeline board
        │   ├── jobs/
        │   │   ├── page.tsx          ← all jobs list
        │   │   ├── new/page.tsx      ← create job form
        │   │   └── [id]/page.tsx     ← single job + candidates
        │   ├── candidates/
        │   │   ├── page.tsx          ← all candidates
        │   │   └── [id]/page.tsx     ← candidate full profile
        │   ├── apply/[jobId]/        ← PUBLIC: candidate applies here
        │   ├── assessment/[token]/   ← PUBLIC: candidate answers test
        │   └── interview/[token]/    ← PUBLIC: AI voice interview room
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useSocket.ts
        ├── lib/
        │   ├── api.ts          ← axios with JWT auto-inject
        │   └── socket.ts       ← Socket.io client
        └── types/
            └── index.ts        ← all TypeScript types
```

---

## Prerequisites

Before you run anything, install these tools on your computer:

### 1. Node.js (v20 or higher)
- Download from: https://nodejs.org
- Pick the **LTS** version
- Verify: open a terminal and run `node --version` → should show `v20.x.x`

### 2. Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- During install: ✅ tick **"Use WSL 2"**, ❌ leave **"Windows containers"** unticked
- After install: restart your PC, then open Docker Desktop and wait for the whale icon to stop animating

### 3. A Groq API Key (free)
- Go to: https://console.groq.com
- Sign up → click **"API Keys"** → **"Create API Key"**
- Copy the key — you'll paste it into `.env`

### 4. A code editor
- VS Code: https://code.visualstudio.com (recommended)

---

## Setup Guide

Follow these steps **in order**. Do not skip any step.

---

### Step 1 — Extract the ZIP

Extract the `hireflow.zip` file somewhere convenient, e.g. `C:\Projects\hireflow` or `~/Projects/hireflow`.

---

### Step 2 — Start Docker services

Open a terminal in the `hireflow/` root folder (the one with `docker-compose.yml`).

```bash
docker-compose up -d
```

This starts **PostgreSQL** (database), **Redis** (cache), and **Kafka** (message bus) as background services.

Verify they're running:
```bash
docker ps
```
You should see 4 containers: `hireflow_postgres`, `hireflow_redis`, `hireflow_zookeeper`, `hireflow_kafka`.

> **Tip:** Every time you restart your computer, run `docker-compose up -d` again before starting the project.

---

### Step 3 — Configure the backend environment

In the `backend/` folder, open the `.env` file. It already has correct values for Docker. The only thing you **must** change is the Groq API key:

```
GROQ_API_KEY="your_groq_api_key_here"
```

Replace `your_groq_api_key_here` with your actual key from https://console.groq.com.

**Optional — Email setup:**
By default, HireFlow uses a test email system (Ethereal) that catches emails without sending them. You'll see email links printed in the backend terminal instead of real emails. This is fine for development.

To use real Gmail:
1. Enable 2FA on your Google account
2. Go to Google Account → Security → App Passwords → create one for "Mail"
3. In `.env`:
```
EMAIL_USER="your_gmail@gmail.com"
EMAIL_PASS="your_16_char_app_password"
```

---

### Step 4 — Install backend dependencies

```bash
cd backend
npm install
```

This installs all Node.js packages. Takes 1–2 minutes.

---

### Step 5 — Set up the database

Still inside the `backend/` folder:

```bash
npx prisma generate
npx prisma db push
```

- `prisma generate` — creates the database client from your schema
- `prisma db push` — creates all tables in PostgreSQL

You should see: `✓ Your database is now in sync with your Prisma schema.`

---

### Step 6 — Install frontend dependencies

Open a **new terminal** tab/window:

```bash
cd frontend
npm install
```

---

### Step 7 — Done! Now run the project.

---

## How to Run the Project

You need **two terminal windows** open at the same time — one for backend, one for frontend.

### Terminal 1 — Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 HireFlow backend running on http://localhost:5000
📡 Socket.io ready
📨 Kafka consumers connected
```

> If you see `⚠️ Kafka not available` — make sure Docker is running: `docker-compose up -d`

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Open the app

Open your browser and go to: **http://localhost:3000**

---

## Using HireFlow — HR Guide

### Register Your Company

1. Go to http://localhost:3000
2. Click **"Get Started Free"**
3. Fill in your company name and your personal admin account details
4. Click **"Create Account"** → you're taken to the dashboard

---

### Post a Job

1. Click **"+ Post a Job"** (top right of dashboard, or in the Jobs section)
2. Fill in:
   - **Job Title** — e.g. "Senior Python Developer"
   - **Department** and **Location** (optional)
   - **Description** — explain the role in detail
   - **Requirements** — ⚠️ **Be specific here.** The AI uses this to screen resumes. Example: `"3+ years Python, FastAPI experience, strong problem solving skills, computer science degree or equivalent"`
3. Click **"Post Job"**

---

### Share the Apply Link

After creating a job, click **"🔗 Copy Apply Link"** on the job page. Share this link with candidates via:
- Your company website
- LinkedIn job post
- Email blast
- WhatsApp/Telegram

The link looks like: `http://localhost:3000/apply/[job-id]`

---

### Watch the Pipeline

Go to **Dashboard**. As candidates apply and move through the pipeline, their cards appear and move across four columns automatically:

| Column | What's happening |
|---|---|
| **Applied** | Just submitted, AI is screening |
| **Assessment** | Screening passed, test was sent |
| **Interview** | Assessment passed, interview invited |
| **Hired** | Interview complete, ready for decision |

Cards update **live** — you don't need to refresh the page.

---

### View a Candidate's Full Profile

Click any candidate card to open their profile. You'll see:

- **Resume screening result** — AI score + reasoning + strengths/concerns
- **Assessment questions** — what they were asked
- **Their answers** — word for word
- **Evaluation report** — scores per question, summary, strengths, weaknesses
- **Interview link** — click to join or review

---

### Making the Final Decision

After the AI interview, the candidate's card sits in the **Interview** column. Click their profile to read the full AI-generated report, then manually move them to **Hired** or **Rejected** using the stage selector on their profile.

---

## Candidate Experience

This is what a candidate sees from their side:

### 1. Application Form
The candidate opens the apply link, fills in name/email/phone, uploads their resume PDF, and clicks Submit. They see a confirmation screen explaining the next steps.

### 2. Assessment Email
If their resume scores 60 or above, they receive an email with a link to their skills test. The email is sent to the address they provided on the form.

> **During development:** If you haven't configured real email, check the **backend terminal** — you'll see a line like `Preview: https://ethereal.email/message/xxx` — open that URL to see the test email.

### 3. Skills Assessment
The candidate opens the link, reads 5 role-specific questions generated by AI, types their answers, and submits. There's no time limit.

### 4. Interview Invitation
If their answers score 50 or above, they receive an email with an interview room link (valid 24 hours).

### 5. AI Voice Interview
The candidate opens the interview link in their browser. They click **"Start Interview"**, allow microphone access, and the AI conducts a voice interview — speaking questions out loud and recording answers. The whole interview takes about 10 minutes.

> **Browser requirement:** Chrome or Edge. Firefox has limited Web Speech API support.

---

## Environment Variables Explained

All in `backend/.env`:

| Variable | What it does | Where to get it |
|---|---|---|
| `DATABASE_URL` | Connection to PostgreSQL | Pre-filled for Docker |
| `REDIS_URL` | Connection to Redis | Pre-filled for Docker |
| `KAFKA_BROKER` | Kafka server address | Pre-filled for Docker |
| `JWT_SECRET` | Signs login tokens — keep this secret | Make up any long random string |
| `GROQ_API_KEY` | Powers all 4 AI agents | https://console.groq.com |
| `EMAIL_HOST` | SMTP server for sending emails | `smtp.gmail.com` for Gmail |
| `EMAIL_USER` | Your email address | Your Gmail |
| `EMAIL_PASS` | Email app password | Google → App Passwords |
| `ENCRYPTION_KEY` | 32-character key for resume encryption | Any 32-character string |
| `PORT` | Backend server port | Leave as `5000` |
| `FRONTEND_URL` | Where the frontend runs | Leave as `http://localhost:3000` |

---

## Troubleshooting

### "Cannot connect to database"
```bash
docker-compose up -d
# Wait 10 seconds, then retry
```

### "Kafka not available" in backend terminal
This is a warning, not a crash. The backend still runs. Agents won't process automatically — but you can test the API manually. To fix: make sure Docker is running and containers are healthy:
```bash
docker ps
docker-compose up -d
```

### "Invalid or expired token" on interview link
Interview links expire after 24 hours. Ask the backend to regenerate — or for development, look at the candidate's `interviewToken` in the database via Prisma Studio:
```bash
cd backend
npx prisma studio
```
Opens at http://localhost:5555 — a visual database browser.

### Resume upload fails
- Make sure the file is a **PDF** (not .doc or .docx)
- File must be under 5MB
- The `backend/uploads/` folder must exist (it's created automatically on first run)

### Frontend shows blank page or crashes
```bash
cd frontend
npm run dev
```
Check the terminal for error messages. Common fix: make sure the backend is running on port 5000.

### "Module not found" errors
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Agents not running (candidates stuck at APPLIED)
1. Check Docker: `docker ps` — all 4 containers must be running
2. Check backend terminal for error messages
3. Restart backend: `Ctrl+C` then `npm run dev`

### How to reset the database (start fresh)
```bash
cd backend
npx prisma db push --force-reset
```
⚠️ This deletes all data.

---

## Tech Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend framework | Next.js | 14 | React-based web app, page routing |
| UI styling | Tailwind CSS | 3 | Utility-first CSS |
| Language | TypeScript | 5 | Type-safe frontend code |
| Backend runtime | Node.js | 20 | Server-side JavaScript |
| Backend framework | Express.js | 4 | REST API routing |
| AI / LLM | Groq (LLaMA 3 70B) | latest | Powers all 4 agents |
| Database | PostgreSQL | 16 | Permanent data storage |
| ORM | Prisma | 5 | Database queries in JavaScript |
| Cache | Redis | 7 | Live candidate state, fast reads |
| Message bus | Kafka | 7.5 | Decouples agents, async pipeline |
| Real-time | Socket.io | 4 | Live dashboard + WebRTC signaling |
| Voice interview | Web Speech API | native | Browser mic + speech synthesis |
| Auth | JWT + bcrypt | — | Secure login, password hashing |
| File encryption | Node crypto (AES-256) | native | Resume file encryption |
| File upload | Multer | 1 | PDF resume handling |
| Email | Nodemailer | 6 | Assessment + interview emails |
| Containers | Docker + Compose | — | Local Kafka, Redis, Postgres |

---

## Quick Reference — All URLs

| URL | Who uses it | What it is |
|---|---|---|
| `http://localhost:3000` | HR / Company | Landing page |
| `http://localhost:3000/register` | HR / Company | Create company account |
| `http://localhost:3000/login` | HR / Company | Sign in |
| `http://localhost:3000/dashboard` | HR / Company | Kanban pipeline board |
| `http://localhost:3000/jobs` | HR / Company | All job postings |
| `http://localhost:3000/jobs/new` | HR / Company | Create a new job |
| `http://localhost:3000/jobs/[id]` | HR / Company | Job detail + candidates |
| `http://localhost:3000/candidates` | HR / Company | All candidates list |
| `http://localhost:3000/candidates/[id]` | HR / Company | Full candidate profile |
| `http://localhost:3000/apply/[jobId]` | Candidate | Submit application |
| `http://localhost:3000/assessment/[token]` | Candidate | Answer skills test |
| `http://localhost:3000/interview/[token]` | Candidate | AI voice interview room |
| `http://localhost:5000/api/health` | Developer | Backend health check |
| `http://localhost:5555` | Developer | Prisma Studio (DB browser) |

---

*HireFlow — Advanced Web Development Terminal Project*
*Stack: Next.js · Node.js · Express · PostgreSQL · Prisma · Redis · Kafka · Socket.io · Groq AI · WebRTC*
