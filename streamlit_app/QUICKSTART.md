# Quick Start Guide - Streamlit App

## Local Setup (2 minutes)

### 1. Navigate to Streamlit app directory
```bash
cd streamlit_app
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup secrets
```bash
# Copy example secrets file
cp .streamlit/secrets.example.toml .streamlit/secrets.toml

# Edit .streamlit/secrets.toml and set:
# API_URL = "http://localhost:5000/api"
```

### 5. Run the app
```bash
streamlit run app.py
```

The app will open at `http://localhost:8501`

## Features

### 🏠 Home Page
- Landing page with HireFlow overview
- Quick links to register or browse jobs

### 🔐 Authentication
- **Register**: Create company account
- **Login**: Sign in with email/password
- **Logout**: Securely sign out

### 📊 Dashboard (Authenticated)
- Real-time pipeline view
- Candidate stage tracking
- Key metrics and stats
- Quick access to jobs and candidates

### 💼 Job Management
- View all job postings
- Create new job postings
- View candidate applications
- Edit job details

### 👥 Candidates
- Browse all candidates
- Filter by stage or search
- View candidate details
- Track screening scores

### 📋 Public Jobs
- Browse available positions (no login required)
- Search and filter jobs
- View job details
- Apply for positions

## Keyboard Shortcuts

- `Ctrl + C` - Stop the app
- `R` - Rerun the app
- `Cmd + Shift + R` - Clear cache

## Tips

- ✅ Keep backend running on `http://localhost:5000`
- ✅ Use Chrome/Firefox for best experience
- ✅ Enable camera/microphone for AI interviews
- ✅ Refresh if you see "connection refused"

## Deploy to Streamlit Cloud

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick version:
1. Push code to GitHub
2. Go to https://streamlit.io/cloud
3. Click "Create app" and select your repo
4. Add secrets in dashboard

## Troubleshooting

### "Connection refused" error
- Make sure backend is running on port 5000
- Check `API_URL` in `.streamlit/secrets.toml`

### Page not loading
- Check browser console (F12)
- Restart the app (Ctrl + C, then `streamlit run app.py`)

### Login not working
- Verify backend auth endpoints
- Check backend logs for errors

Need help? Check the README.md or DEPLOYMENT.md files.
