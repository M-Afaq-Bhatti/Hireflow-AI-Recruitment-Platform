<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=4f46e5&height=200&section=header&text=HireFlow&fontSize=80&fontColor=ffffff&fontAlignY=35&desc=Autonomous%20AI%20Recruitment%20Pipeline&descAlignY=55&descSize=20&descColor=c7d2fe" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.5-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)](https://kafka.apache.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Groq](https://img.shields.io/badge/Groq_AI-LLaMA_3_70B-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

<br/>

> **HireFlow** compresses a two-week hiring process into a fully autonomous **3-minute AI pipeline.**
> Five specialized agents screen resumes, generate assessments, evaluate answers, conduct live voice interviews, and produce a final hiring recommendation — without a single human click.

<br/>

```
  Resume Submitted  ──►  Agent 1 Screens  ──►  Agent 2 Tests  ──►  Agent 3 Grades  ──►  Agent 4 Interviews  ──►  Agent 5 Finalizes  ──►  HR Decides
       📄                     🤖                    📝                   📊                     🎤                         🏁                    ✅
```

</div>

---

## 📌 Table of Contents

- [Why HireFlow?](#-why-hireflow)
- [System Architecture](#-system-architecture)
- [The Multi-Agent AI Pipeline](#-the-multi-agent-ai-pipeline)
- [Tech Stack Deep Dive](#-tech-stack-deep-dive)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security Model](#-security-model)
- [Real-Time Infrastructure](#-real-time-infrastructure)
- [Screenshots & Flow](#-flow-walkthrough)

---

## 🎯 Why HireFlow?

Traditional hiring is broken. A single job post receives hundreds of applications. HR teams spend weeks doing repetitive work — reading resumes, writing tests, scheduling calls, conducting first-round interviews. Most of that work is mechanical and can be automated.

HireFlow is built on one insight: **the first three rounds of hiring are pattern-matching problems** that AI solves better and faster than humans.

| Traditional Hiring | HireFlow |
|---|---|
| Resume screening: 2–3 days | Resume screening: ~15 seconds |
| Test design: 1–2 days | Assessment generation: instant |
| Answer grading: 1–2 days | AI evaluation: ~30 seconds |
| First-round interview scheduling: 3–5 days | AI voice interview: immediate |
| **Total: 2–4 weeks** | **Total: ~3 minutes** |

HR professionals stay in the loop at the decision stage — the one place where human judgment genuinely matters.

---

## 🏗 System Architecture

HireFlow is a **distributed multi-service system**. Each layer is independently scalable and connected through async message passing.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                               │
│   Next.js 14 (App Router)  ·  TypeScript  ·  Tailwind CSS          │
│   HR Dashboard  ·  Job Management  ·  Candidate Profiles            │
│   Real-time Kanban via Socket.io  ·  WebRTC Interview Room          │
└────────────────────────┬────────────────────────────────────────────┘
                         │  REST API  +  WebSocket
┌────────────────────────▼────────────────────────────────────────────┐
│                        BACKEND LAYER                                │
│   Node.js 20  ·  Express.js  ·  Socket.io Server                   │
│   JWT Auth  ·  Multer File Upload  ·  AES-256 Encryption            │
│   Prisma ORM  ·  Rate Limiting  ·  Tenant Isolation                 │
└──────┬─────────────────┬────────────────────┬───────────────────────┘
       │                 │                    │
┌──────▼──────┐  ┌───────▼──────┐  ┌─────────▼─────────┐
│  PostgreSQL │  │    Redis     │  │   Apache Kafka     │
│  (Prisma)   │  │  (ioredis)   │  │   (KafkaJS)        │
│             │  │              │  │                    │
│  Tenants    │  │  Live Stage  │  │  resume-submitted  │
│  Users      │  │  Cache       │  │  screening-passed  │
│  Jobs       │  │  Job Config  │  │  assessment-done   │
│  Candidates │  │  Room Tokens │  │  interview-invited │
│  Evals      │  │              │  │                    │
└─────────────┘  └──────────────┘  └────────┬───────────┘
                                            │
┌───────────────────────────────────────────▼───────────────────────┐
│                     AI AGENT LAYER                                 │
│                                                                    │
│  Agent 1         Agent 2         Agent 3         Agent 4         Agent 5     │
│  Screener   ──►  Assessor   ──►  Evaluator  ──►  Interviewer ──► Finalizer │
│  (Groq AI)       (Groq AI)       (Groq AI)       (WebRTC)       (Groq AI)   │
└───────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Why Kafka instead of direct function calls?**
Each agent is decoupled. If Agent 2 goes down, Agent 1 keeps publishing — messages queue up and Agent 2 processes them on restart. Zero data loss. This is production-grade fault tolerance, not just a demo.

**Why Redis alongside PostgreSQL?**
PostgreSQL is the source of truth. Redis is the speed layer. The HR dashboard polls candidate stages 10–20 times per second during active hiring sessions — Redis handles that load at sub-millisecond latency. PostgreSQL doesn't even get touched.

**Why multi-tenancy at the database level?**
Every DB query is scoped by `tenantId`. Company A and Company B share one deployment but their data is physically impossible to cross-contaminate — not just access-controlled but structurally isolated.

---

## 🤖 The Multi-Agent AI Pipeline

Each agent is an independent Node.js module that:
1. **Consumes** a Kafka message from its input topic
2. **Calls** the Groq LLM (LLaMA 3 70B) with a structured prompt
3. **Parses** the JSON response and updates the database
4. **Publishes** to the next Kafka topic to hand off to the next agent
5. **Emits** a Socket.io event so the HR dashboard updates live

```
                        ┌─────────────────────────────────┐
                        │         KAFKA BUS               │
                        │                                 │
 resume-submitted ──────►  Agent 1: Resume Screener       │
                        │     • Groq LLaMA 3 70B          │
                        │     • Score 0–100 vs JD         │
                        │     • Qualified if score ≥ 60   │
                        │             │                   │
                        │    screening-passed ────────────►
                        │                                 │
                        │  Agent 2: Assessment Generator  │
                        │     • Groq generates 5 Qs       │
                        │     • Role-specific questions   │
                        │     • Emails link via SMTP      │
                        │             │                   │
                        │   assessment-submitted ─────────►
                        │                                 │
                        │  Agent 3: Answer Evaluator      │
                        │     • Groq grades each answer   │
                        │     • Produces scored report    │
                        │     • Shortlists if score ≥ 50  │
                        │             │                   │
                        │    interview-invited ───────────►
                        │                                 │
                        │  Agent 4: Interview Coordinator │
                        │     • Signed JWT room token     │
                        │     • Redis TTL (24h)           │
                        │     • Web Speech API interview  │
                        │             │                   │
                        │  interview-completed ───────────►
                        │                                 │
                        │  Agent 5: Final Evaluator       │
                        │     • Evaluates interview notes │
                        │     • Generates aggregate score │
                        │     • Recommends hire / reject  │
                        └─────────────────────────────────┘
```

### Agent 1 — Resume Screener

**Input:** Candidate resume (PDF, decrypted in memory) + Job description + Requirements

**Prompt strategy:** System prompt instructs LLaMA 3 to act as a senior recruiter. User message contains the job requirements and resume text. Response is forced to JSON via `response_format: { type: "json_object" }`.

**Output schema:**
```json
{
  "score": 82,
  "qualified": true,
  "strengths": ["5 years Python", "FastAPI experience", "Led team of 4"],
  "concerns": ["No cloud deployment experience mentioned"],
  "reasoning": "Strong backend match. Meets 4 of 5 core requirements."
}
```

**Decision gate:** Score ≥ 60 → publishes `screening-passed`. Score < 60 → candidate stage set to `SCREENED_OUT`, pipeline ends.

---

### Agent 2 — Assessment Generator

**Input:** Job title, description, requirements, candidate name

**Prompt strategy:** Instructs LLaMA 3 to generate exactly 5 open-ended, practical questions tailored to the specific role. Not multiple choice — requires demonstrated knowledge.

**Output schema:**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "You're building a REST API in FastAPI that needs to handle 10,000 req/s. Walk me through your approach to performance optimization.",
      "type": "text",
      "maxScore": 20
    }
  ]
}
```

**After generation:** Questions saved to PostgreSQL. Unique assessment token (UUID) generated. Email sent via Nodemailer with the assessment link.

---

### Agent 3 — Answer Evaluator

**Input:** All 5 questions + candidate's answers + job requirements

**Prompt strategy:** LLaMA 3 acts as a senior technical interviewer. Each answer is scored independently against the question and job context. Holistic summary written at the end.

**Output schema:**
```json
{
  "scores": [
    { "questionId": 1, "score": 17, "feedback": "Demonstrated knowledge of connection pooling and async I/O. Missed mentioning caching layer." }
  ],
  "totalScore": 74,
  "summary": "Strong technical communicator with solid Python fundamentals. Gap in distributed systems.",
  "strengths": ["Clear problem decomposition", "Production mindset"],
  "weaknesses": ["Limited cloud-native experience"],
  "recommendation": "SHORTLIST"
}
```

**Decision gate:** `SHORTLIST` or `totalScore ≥ 50` → publishes `interview-invited`. Otherwise → `REJECTED`.

---

### Agent 4 — Interview Coordinator

**Input:** Candidate ID + Job ID from Kafka message

**What it does:**
1. Calls Groq to generate 4 behavioral/situational interview questions tailored to the role
2. Signs a JWT interview token (`type: "interview"`, `expiresIn: "24h"`)
3. Stores token in Redis with 24-hour TTL
4. Emails the candidate a unique interview room URL
5. Emits Socket.io event to push the interview link to the HR dashboard

**Interview room** (`/interview/[token]`):
- Token is verified server-side before room loads
- Web Speech API (`SpeechSynthesisUtterance`) reads questions aloud
- `webkitSpeechRecognition` / `SpeechRecognition` records spoken answers
- 60-second window per answer with live countdown
- Full transcript saved to database on completion

---

### Agent 5 — Final Interview Evaluator

**Input:** Candidate record, assessment results, interview notes, and job context

**What it does:**
1. Reads the candidate's interview transcript and prior stage scores
2. Calls Groq to evaluate interview performance and summarize strengths/weaknesses
3. Computes a weighted final score across screening, assessment, and interview
4. Calls Groq again to generate a final hiring recommendation
5. Saves the interview review and updates candidate stage to `FINAL_REVIEW`
6. Emits a live socket update with `finalScore` and `recommendation`

**Output schema:**
```json
{
  "score": 78,
  "summary": "Strong communicator with solid role fit; needs deeper cloud experience.",
  "strengths": ["Clear storytelling", "Problem solving"],
  "weaknesses": ["Cloud architecture depth"],
  "finalScore": 75,
  "recommendation": "HIRE"
}
```

**Decision gate:** `finalScore ≥ 65` → `HIRE` / `STRONG_HIRE`. Otherwise → `CONSIDER` or `REJECTED` depending on the final evaluation.

---

## 🛠 Tech Stack Deep Dive

### Frontend

| Technology | Role | Why |
|---|---|---|
| **Next.js 14** | Framework | App Router, server components, built-in routing |
| **TypeScript** | Language | Type safety across 30+ component files |
| **Tailwind CSS** | Styling | Utility-first, dark theme, zero CSS files |
| **Socket.io Client** | Real-time | Live Kanban board updates without polling |
| **Web Speech API** | Voice | Native browser TTS + STT, no third-party cost |
| **WebRTC** | Signaling | Peer-to-peer audio layer for interview room |
| **Axios** | HTTP | Interceptor-based JWT injection on all requests |

### Backend

| Technology | Role | Why |
|---|---|---|
| **Node.js 20** | Runtime | Non-blocking I/O, ideal for event-driven pipeline |
| **Express.js** | Framework | Lightweight REST API with middleware chain |
| **Prisma ORM** | Database | Type-safe queries, auto migrations, schema-first |
| **KafkaJS** | Messaging | Pure JS Kafka client, async consumer groups |
| **ioredis** | Cache | Pipeline commands, connection retry, TTL support |
| **Socket.io** | WebSockets | Rooms per tenant, JWT auth middleware |
| **Multer** | File Upload | Disk storage, MIME type validation, size limits |
| **bcryptjs** | Passwords | 12-round salt, timing-safe compare |
| **jsonwebtoken** | Auth | HS256 signed tokens, scoped interview tokens |
| **Nodemailer** | Email | SMTP transporter, HTML templates |
| **pdf-parse** | PDF | Extract text from encrypted resume buffer |

### Infrastructure

| Technology | Role |
|---|---|
| **PostgreSQL 16** | Relational data — tenants, jobs, candidates, evals |
| **Redis 7** | Sub-ms cache — live stages, room tokens, job configs |
| **Apache Kafka 7.5** | Async message bus — decouples all 5 agents |
| **Zookeeper** | Kafka cluster coordination |
| **Docker Compose** | Local orchestration of all 5 services |

### AI

| Technology | Role |
|---|---|
| **Groq Cloud API** | LLM inference provider |
| **LLaMA 3 70B** | Model powering all 5 agents |
| **JSON mode** | Forces structured output from every agent |
| **System prompts** | Role-specific persona per agent (recruiter / interviewer / evaluator) |

---

## 📁 Project Structure

```
hireflow/
│
├── 📄 docker-compose.yml          # PostgreSQL + Redis + Kafka + Zookeeper
├── 📄 .env.example                # Environment variable template
├── 📄 README.md
│
├── 📂 backend/                    # Node.js + Express
│   ├── 📄 server.js               # Entry point — Express + Socket.io init
│   ├── 📄 package.json
│   ├── 📄 .env                    # Secrets (never committed)
│   │
│   ├── 📂 prisma/
│   │   └── 📄 schema.prisma       # DB schema — Tenant, User, Job, Candidate, Assessment, Evaluation
│   │
│   ├── 📂 src/
│   │   ├── 📂 agents/             # ⭐ The AI pipeline core
│   │   │   ├── 📄 agent1.screener.js      # Resume scoring
│   │   │   ├── 📄 agent2.assessor.js      # Assessment generation + email
│   │   │   ├── 📄 agent3.evaluator.js     # Answer grading + report
│   │   │   ├── 📄 agent4.interviewer.js   # Token generation + interview setup
│   │   │   ├── 📄 agent5.evaluator_final.js# Final interview evaluation + recommendation
│   │   │   └── 📄 prompts.js              # All LLM prompt templates
│   │   │
│   │   ├── 📂 kafka/              # Message bus layer
│   │   │   ├── 📄 producer.js     # Publish to topics
│   │   │   ├── 📄 consumer.js     # Subscribe agents to topics
│   │   │   └── 📄 topics.js       # Topic name constants
│   │   │
│   │   ├── 📂 sockets/            # Real-time layer
│   │   │   ├── 📄 socket.server.js      # Socket.io init + JWT auth middleware
│   │   │   └── 📄 dashboard.socket.js   # Emit stage updates per tenant
│   │   │
│   │   ├── 📂 routes/             # REST API endpoints
│   │   │   ├── 📄 auth.routes.js          # POST /register, POST /login
│   │   │   ├── 📄 job.routes.js           # CRUD + public job endpoint
│   │   │   ├── 📄 candidate.routes.js     # Apply, list, profile, stage override
│   │   │   ├── 📄 assessment.routes.js    # Get by token, submit answers
│   │   │   ├── 📄 interview.routes.js     # Validate token, complete interview
│   │   │   └── 📄 tenant.routes.js        # Dashboard stats
│   │   │
│   │   ├── 📂 middleware/
│   │   │   ├── 📄 auth.middleware.js      # JWT verification on protected routes
│   │   │   └── 📄 upload.middleware.js    # Multer — PDF only, 5MB max
│   │   │
│   │   └── 📂 services/           # Shared utility layer
│   │       ├── 📄 groq.service.js         # Groq API wrapper with JSON mode
│   │       ├── 📄 redis.service.js        # Stage cache + token store
│   │       ├── 📄 email.service.js        # Assessment + interview email templates
│   │       ├── 📄 crypto.service.js       # AES-256-CBC resume encryption
│   │       └── 📄 token.service.js        # JWT sign/verify + interview tokens
│   │
│   └── 📂 uploads/                # Encrypted resume files
│
└── 📂 frontend/                   # Next.js 14 App Router
    ├── 📄 package.json
    ├── 📄 next.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 tsconfig.json
    │
    └── 📂 src/
        ├── 📂 app/
        │   ├── 📄 layout.tsx              # Root layout + global styles
        │   ├── 📄 page.tsx                # Landing page
        │   ├── 📄 globals.css             # Tailwind + custom CSS vars
        │   │
        │   ├── 📂 (auth)/                 # Route group — no sidebar
        │   │   ├── 📂 login/page.tsx
        │   │   └── 📂 register/page.tsx   # Company onboarding
        │   │
        │   ├── 📂 dashboard/
        │   │   ├── 📄 layout.tsx          # Sidebar + nav
        │   │   └── 📄 page.tsx            # Live Kanban pipeline board
        │   │
        │   ├── 📂 jobs/
        │   │   ├── 📄 page.tsx            # All job postings
        │   │   ├── 📂 new/page.tsx        # Create job form
        │   │   └── 📂 [id]/page.tsx       # Job detail + candidate table
        │   │
        │   ├── 📂 candidates/
        │   │   ├── 📄 page.tsx            # All candidates with filter
        │   │   └── 📂 [id]/page.tsx       # Full AI report profile
        │   │
        │   ├── 📂 apply/[jobId]/          # PUBLIC — candidate application form
        │   ├── 📂 assessment/[token]/     # PUBLIC — skills test
        │   └── 📂 interview/[token]/      # PUBLIC — AI voice interview room
        │
        ├── 📂 hooks/
        │   ├── 📄 useAuth.ts              # JWT read/save/logout
        │   └── 📄 useSocket.ts            # Socket.io event listener
        │
        ├── 📂 lib/
        │   ├── 📄 api.ts                  # Axios instance + JWT interceptor
        │   └── 📄 socket.ts               # Socket.io client singleton
        │
        └── 📂 types/
            └── 📄 index.ts                # All shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v20+ LTS | [nodejs.org](https://nodejs.org) |
| Docker Desktop | Latest | [docker.com](https://docker.com/products/docker-desktop) |
| Groq API Key | Free | [console.groq.com](https://console.groq.com) |

### 1. Clone & Extract

```bash
git clone https://github.com/yourusername/hireflow.git
cd hireflow
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL, Redis, Kafka, and Zookeeper. Verify with `docker ps`.

### 3. Configure Environment

```bash
cp .env.example backend/.env
```

Open `backend/.env` and set your Groq API key:

```env
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"
```

### 4. Install & Initialize Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 5. Install Frontend

```bash
cd ../frontend
npm install
```

### 6. Run

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend && npm run dev
```

Open **http://localhost:3000** → Register your company → Post a job → Share the apply link.

---

## 🔐 Security Model

HireFlow is built with a layered security model across every part of the stack.

### Authentication — JWT

Every protected route and Socket.io connection verifies a signed JWT. Tokens carry `userId`, `tenantId`, and `role`. No session state on the server — fully stateless.

```
Client Request
     │
     ▼
auth.middleware.js
     │
     ├── No token → 401 Unauthorized
     ├── Invalid signature → 401 Unauthorized
     ├── Expired → 401 Unauthorized
     └── Valid → req.user = { userId, tenantId, role }
                      │
                      ▼
              Route Handler
              (all DB queries scoped to tenantId)
```

### Multi-Tenant Isolation

Every database table has a `tenantId` foreign key. Every query automatically filters by `req.user.tenantId`. A user from Tenant A cannot retrieve, modify, or even discover the existence of Tenant B's data.

### Resume Encryption

Resumes are encrypted using **AES-256-CBC** before being written to disk. A 16-byte random IV is prepended to each encrypted file. Decryption only happens in-memory during AI processing — the decrypted content is never written back to disk.

```
Upload → Multer saves to disk → crypto.service encrypts in-place
                                      │
                        IV (16 bytes) + Ciphertext
                                      │
                              Stored in uploads/
```

### Interview Room Tokens

Each interview link is a short-lived JWT (`expiresIn: 24h`) scoped with `type: "interview"`. It's also stored in Redis with a matching TTL. A request to join the room must pass both the JWT verification and the Redis lookup — invalidating either one denies access.

### Socket.io Auth

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const decoded = verifyToken(token);  // throws if invalid
  socket.user = decoded;
  socket.join(`tenant:${decoded.tenantId}`);  // isolated room per company
  next();
});
```

HR dashboards from Company A and Company B are in different Socket.io rooms — they never receive each other's events.

---

## ⚡ Real-Time Infrastructure

### Socket.io — Live Dashboard

When any agent updates a candidate's stage, it emits immediately to the HR dashboard:

```javascript
// In any agent, after DB update:
emitCandidateUpdate(tenantId, {
  candidateId,
  stage: 'INTERVIEW',
  evaluationScore: 74
});

// On the frontend, useSocket hook:
socket.on('candidate:updated', (data) => {
  setCandidates(prev =>
    prev.map(c => c.id === data.candidateId ? { ...c, ...data } : c)
  );
});
```

The Kanban card moves across columns in real time — no polling, no page refresh.

### Kafka — Agent Decoupling

```
Agent 1 finishes
    │
    └── producer.send({ topic: 'screening-passed', message: { candidateId } })
              │
              │   (Agent 1 is done — it moves on immediately)
              │
              ▼
    Kafka broker stores message
              │
              ▼  (whenever Agent 2 is ready)
    consumer.run → eachMessage → agent2.run(data)
```

Even if Agent 2 is restarting, messages don't get lost. Kafka holds them until a consumer picks them up.

### Redis — Live Stage Cache

```
Candidate moves to INTERVIEW
         │
         ├── prisma.candidate.update({ stage: 'INTERVIEW' })   ← source of truth
         └── redis.set(`tenant:X:candidate:Y:stage`, 'INTERVIEW', EX 2592000)
                           │
                           ▼
              Dashboard reads Redis (< 1ms)
              instead of PostgreSQL (5–20ms)
```

---

## 🌐 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register company + admin user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | ✅ | List all jobs for tenant |
| `POST` | `/api/jobs` | ✅ | Create new job posting |
| `GET` | `/api/jobs/:id` | ✅ | Job detail + candidates |
| `PUT` | `/api/jobs/:id` | ✅ | Update job |
| `DELETE` | `/api/jobs/:id` | ✅ | Delete job |
| `GET` | `/api/jobs/public/:id` | ❌ | Public job info (for apply form) |

### Candidates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/candidates/apply` | ❌ | Submit application + resume PDF |
| `GET` | `/api/candidates` | ✅ | List all candidates for tenant |
| `GET` | `/api/candidates/:id` | ✅ | Full candidate profile + AI reports |
| `PATCH` | `/api/candidates/:id/stage` | ✅ | Manual stage override |

### Assessments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/assessments/:token` | ❌ | Get assessment questions by token |
| `POST` | `/api/assessments/:token/submit` | ❌ | Submit answers → triggers Agent 3 |

### Interviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/interviews/:token` | ❌ | Validate token + get interview questions |
| `POST` | `/api/interviews/:token/complete` | ❌ | Save interview transcript |

### Tenant
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tenants/stats` | ✅ | Dashboard stats (jobs, candidates, by stage) |

---

## 🔑 Environment Variables

```env
# ── Database ───────────────────────────────────────────────
DATABASE_URL="postgresql://admin:hireflow_secret@localhost:5432/hireflow"

# ── Redis ──────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379"

# ── Kafka ──────────────────────────────────────────────────
KAFKA_BROKER="localhost:9092"

# ── Auth ───────────────────────────────────────────────────
JWT_SECRET="your_64_char_random_secret_here"
JWT_EXPIRES_IN="7d"

# ── AI ─────────────────────────────────────────────────────
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"      # console.groq.com — free

# ── Email ──────────────────────────────────────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your_16_char_app_password"       # Google App Passwords

# ── Security ───────────────────────────────────────────────
ENCRYPTION_KEY="exactly_32_characters_here!!"   # AES-256 key

# ── Server ─────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

---

## 🗺 Flow Walkthrough

```
1. HR registers company          /register
        │
2. HR creates job posting        /jobs/new
        │  (requirements field powers the AI screening)
        │
3. HR shares apply link          /apply/[jobId]
        │
4. Candidate submits resume PDF
        │
        ▼
   ┌────────────────────────────────────┐
   │  AUTONOMOUS PIPELINE BEGINS        │
   │                                    │
   │  Agent 1 ─ Resume Screener         │  ~15 seconds
   │    Groq scores resume vs JD        │
   │    Dashboard card appears: APPLIED  │
   │             │                      │
   │    score ≥ 60?                     │
   │             │                      │
   │  Agent 2 ─ Assessment Generator   │  ~10 seconds
   │    Groq writes 5 custom questions  │
   │    Email sent to candidate         │
   │    Dashboard: ASSESSMENT           │
   │             │                      │
   │  Candidate submits answers         │  (candidate's own time)
   │             │                      │
   │  Agent 3 ─ Answer Evaluator       │  ~20 seconds
   │    Groq grades each answer         │
   │    Evaluation report written       │
   │    Dashboard: EVALUATING → INTERVIEW│
   │             │                      │
   │  Agent 4 ─ Interview Coordinator  │  ~5 seconds
   │    Signed JWT room token created   │
   │    Interview email sent            │
   │    Dashboard: INTERVIEW            │
   │             │                      │
   │  Agent 5 ─ Final Interview Evaluator│  ~10 seconds
   │    Review interview + final score  │
   │    Recommendation generated        │
   │    Dashboard: FINAL_REVIEW         │
   └────────────────────────────────────┘
        │
5. Candidate opens interview link    /interview/[token]
        │  Browser mic + Web Speech API
        │  AI speaks questions, records answers
        │
6. HR views full AI report           /candidates/[id]
        │  Screening score + reasoning
        │  Assessment questions + answers
        │  Evaluation scores + summary
        │  Interview transcript
        │
7. HR makes final decision           HIRED / REJECTED
```

---

## 📊 Database Schema

```
Tenant ─────────────── User
  │                    (Admin / HR)
  │
  └── Job ─────────── Candidate ───── Assessment
        (1 job          (many           (1 per candidate,
        → many          candidates)     questions + answers)
        candidates)          │
                             └── Evaluation
                                 (scores, summary,
                                  strengths, weaknesses)
```

**Key design choices:**
- `tenantId` on `Job` (not `Candidate`) — candidates are isolated through job ownership
- `Assessment.token` is a UUID used as a public URL parameter — not guessable
- `Candidate.screeningNotes` stores the full Groq JSON response — no data lost
- `Evaluation.scores` is a JSON array — flexible per-question scoring without schema changes

---

<div align="center">

### Built with 🤖 AI · ⚡ Real-time · 🔐 Security · 📨 Async Messaging

**Next.js** · **Node.js** · **PostgreSQL** · **Redis** · **Apache Kafka** · **Socket.io** · **Groq AI** · **WebRTC** · **Docker**

<br/>

*Advanced Web Development — Terminal Project*

<img src="https://capsule-render.vercel.app/api?type=waving&color=4f46e5&height=100&section=footer" width="100%"/>

</div>