# Main Project Setup Guide

This guide covers setting up the entire HireFlow system with the new Streamlit frontend.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│   Streamlit Frontend (Streamlit Cloud)  │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
                 ↓
┌─────────────────────────────────────────┐
│   Backend (Node.js + Express)           │
│   - Job Management                      │
│   - Candidate Pipeline                  │
│   - AI Agents (Screening, Assessment)   │
│   - Kafka (Event Processing)            │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
    ┌─────────┐      ┌──────────┐
    │ Prisma  │      │ Kafka &  │
    │ (DB)    │      │ Redis    │
    └─────────┘      └──────────┘
```

## Option 1: Streamlit Cloud (Recommended - Free)

### Benefits
✅ Free hosting  
✅ Easy deployment  
✅ Automatic scaling  
✅ Built-in HTTPS  
✅ Zero infrastructure management

### Setup Steps

1. **Deploy Backend**
   - Deploy your Node.js backend to a cloud provider (Heroku, Railway, Render, AWS, etc.)
   - Ensure it's publicly accessible with HTTPS

2. **Deploy Streamlit App**
   - Follow [streamlit_app/DEPLOYMENT.md](./streamlit_app/DEPLOYMENT.md)
   - Your app will be available at `https://your-app-name.streamlit.app`

3. **Configure Backend CORS**
   ```javascript
   app.use(cors({
     origin: ["https://your-app-name.streamlit.app"],
     credentials: true,
   }));
   ```

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose (optional)

### Quick Start

#### Backend Setup
```bash
# Install dependencies
cd backend
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start backend
npm run dev
# Backend running at http://localhost:5000
```

#### Streamlit Frontend Setup
```bash
# In new terminal
cd streamlit_app

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create secrets file
cp .streamlit/secrets.example.toml .streamlit/secrets.toml
# Edit .streamlit/secrets.toml with:
# API_URL = "http://localhost:5000/api"

# Run Streamlit
streamlit run app.py
# App available at http://localhost:8501
```

### Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.yml -f streamlit_app/docker-compose-addon.yml up -d

# View logs
docker-compose logs -f streamlit

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:8501
- Backend API: http://localhost:5000
- Kafka: localhost:9092
- Redis: localhost:6379

## Option 3: Docker Only (Frontend)

If you only want to run the Streamlit frontend in Docker:

```bash
cd streamlit_app
docker build -t hireflow-streamlit .
docker run -p 8501:8501 \
  -e API_URL=https://your-backend-api.com/api \
  hireflow-streamlit
```

## Features Comparison

| Feature | Local Dev | Docker | Streamlit Cloud |
|---------|-----------|--------|-----------------|
| Cost | Free | Free | Free |
| Setup Time | 10 min | 5 min | 3 min |
| Maintenance | High | Medium | Low |
| Scalability | Limited | Good | Excellent |
| HTTPS | No | No | Yes |
| Best For | Development | Testing | Production |

## Frontend Features

### 🏠 Home Page
- Landing page with overview
- Quick links to register or browse jobs

### 🔐 Authentication
- Company registration
- Email/password login
- Secure session management

### 📊 Dashboard (Admin)
- Real-time pipeline view
- Candidate stage tracking
- Key metrics

### 💼 Job Management
- Create job postings
- View candidate applications
- Track job status

### 👥 Candidate Management
- Browse all candidates
- Filter by stage or search
- View screening scores and details

### 📋 Public Jobs (Candidate)
- Browse open positions
- Apply for jobs
- Track application status

## Backend API Requirements

Ensure your backend provides these endpoints:

**Authentication**
- `POST /auth/register` - Company registration
- `POST /auth/login` - User login

**Jobs**
- `GET /jobs` - List company jobs
- `GET /jobs/public` - List public jobs
- `POST /jobs` - Create job
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job

**Candidates**
- `GET /candidates` - List candidates
- `GET /candidates/:id` - Get candidate details
- `GET /candidates/:id/resume` - Download resume

**Dashboard**
- `GET /tenants/stats` - Get dashboard statistics

## Environment Variables

### Backend
```bash
DATABASE_URL=postgresql://user:pass@localhost/hireflow
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8501  # or https://your-app-name.streamlit.app
GROQ_API_KEY=your-groq-key
```

### Streamlit
```toml
# .streamlit/secrets.toml
API_URL = "http://localhost:5000/api"  # Local dev
# OR
API_URL = "https://your-backend-api.com/api"  # Production
```

## Troubleshooting

### API Connection Failed
- Check backend is running
- Verify `API_URL` is correct
- Check CORS headers on backend
- Verify network connectivity

### Login Not Working
- Check backend auth endpoints
- Verify database is running
- Look at backend logs

### Streamlit Cloud Deployment Issues
- Check deployment logs
- Verify `requirements.txt` has all dependencies
- Confirm secrets are set correctly
- Ensure backend is publicly accessible

## Next Steps

1. **Deploy Backend**
   - Choose a cloud provider (Render, Railway, Heroku, AWS)
   - Follow their deployment guide
   - Set environment variables

2. **Configure Backend CORS**
   - Add Streamlit Cloud URL to CORS origins
   - Enable HTTPS on backend

3. **Deploy Streamlit**
   - Push code to GitHub
   - Connect Streamlit Cloud
   - Add secrets

4. **Test**
   - Register new company
   - Create job posting
   - Test all features

## Support & Resources

- **Streamlit Docs**: https://docs.streamlit.io
- **Streamlit Cloud**: https://streamlit.io/cloud
- **Express.js Docs**: https://expressjs.com
- **Prisma Docs**: https://www.prisma.io/docs

## Quick Commands

```bash
# Streamlit - Install dependencies
pip install -r requirements.txt

# Streamlit - Run app
streamlit run app.py

# Streamlit - Deploy to cloud
git push origin main  # Auto-deploys

# Backend - Install dependencies
npm install

# Backend - Run migrations
npx prisma migrate dev

# Backend - Start server
npm run dev

# Docker - Build
docker-compose build

# Docker - Start
docker-compose up -d

# Docker - Stop
docker-compose down
```
