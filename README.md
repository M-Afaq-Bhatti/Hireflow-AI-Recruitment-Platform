# HireFlow 🚀

**Autonomous AI Recruitment Platform** — 4-stage multi-agent pipeline that compresses a 2-week hiring process into 3 minutes.

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Setup backend
cd backend
cp ../.env.example .env        # then edit .env and add your GROQ_API_KEY
npm install
npx prisma generate
npx prisma db push
npm run dev                    # runs on http://localhost:5000

# 3. In a new terminal — start frontend
cd frontend
npm install
npm run dev                    # runs on http://localhost:3000
```

Open http://localhost:3000 → Register your company → Post a job → Share the apply link.

**Read the full setup guide:** `USER_MANUAL.md`

## Pipeline

```
Resume Submitted → Agent 1 Screens → Agent 2 Sends Assessment
→ Candidate Submits → Agent 3 Evaluates → Agent 4 Interviews → HR Decides
```

## Stack

Next.js 14 · Node.js · Express · PostgreSQL · Prisma · Redis · Kafka · Socket.io · Groq AI · WebRTC
