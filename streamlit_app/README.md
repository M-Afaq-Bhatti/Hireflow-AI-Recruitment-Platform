# HireFlow Streamlit App

AI-powered recruitment platform with a Streamlit interface. This app provides the same functionality as the Next.js frontend but is deployed to Streamlit Cloud for free hosting.

## Features

✨ **Core Features:**
- 🔐 User authentication (register/login)
- 💼 Job posting management
- 👥 Candidate management
- 📊 Pipeline dashboard
- 🤖 AI-powered recruitment pipeline
  - Resume screening
  - Assessment generation
  - Answer evaluation
  - AI interviews

## Setup

### Local Development

1. **Clone the repository:**
   ```bash
   cd streamlit_app
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create secrets file:**
   ```bash
   cp .streamlit/secrets.example.toml .streamlit/secrets.toml
   ```

5. **Edit `.streamlit/secrets.toml` with your backend API URL:**
   ```toml
   API_URL = "http://localhost:5000/api"
   ```

6. **Run the app:**
   ```bash
   streamlit run app.py
   ```

The app will be available at `http://localhost:8501`

## Deployment to Streamlit Cloud

### Prerequisites
- GitHub account
- Streamlit Cloud account (free at https://streamlit.io/cloud)

### Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Streamlit app"
   git push origin main
   ```

2. **Deploy on Streamlit Cloud:**
   - Go to https://share.streamlit.io/
   - Click "Create app"
   - Select your repository and branch
   - Set `app.py` as the main file path

3. **Add Secrets in Streamlit Cloud:**
   - In Streamlit Cloud dashboard, go to your app
   - Click "Settings" → "Secrets"
   - Add your secrets:
     ```toml
     API_URL = "https://your-backend-api.com/api"
     ```

## Environment Variables

**Required:**
- `API_URL` - Backend API URL (default: http://localhost:5000/api)

**Optional (set in .streamlit/secrets.toml):**
- Add any additional secrets your app needs

## Project Structure

```
streamlit_app/
├── app.py                    # Main entry point
├── requirements.txt          # Python dependencies
├── .streamlit/
│   ├── config.toml          # Streamlit configuration
│   ├── secrets.example.toml  # Secrets template
│   └── secrets.toml          # Actual secrets (gitignored)
├── pages/
│   ├── auth.py              # Login/Register pages
│   ├── dashboard.py         # Pipeline dashboard
│   ├── jobs.py              # Job management
│   ├── candidates.py        # Candidate management
│   └── public_jobs.py       # Public job listings
└── utils/
    ├── api.py               # API client
    ├── auth.py              # Authentication utilities
    └── helpers.py           # Helper functions
```

## Usage

### For Recruiters

1. **Register** - Create company account
2. **Login** - Access the dashboard
3. **Post Job** - Create job postings
4. **View Pipeline** - Monitor candidate progression
5. **Manage Candidates** - Review screening scores and details

### For Candidates

1. **Browse Jobs** - View available positions
2. **Apply** - Submit resume for positions
3. **Assessment** - Complete AI-generated assessment
4. **Interview** - Participate in AI interview

## API Integration

The app connects to the backend API at `API_URL`. Ensure your backend is running and accessible.

**Required Backend Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /jobs` - List company jobs
- `GET /jobs/public` - List public jobs
- `POST /jobs` - Create job
- `GET /candidates` - List candidates
- `GET /tenants/stats` - Get dashboard stats

## Configuration

### Streamlit Settings (`.streamlit/config.toml`)

Modify theme colors, page size, and other settings here. Current settings:

```toml
[theme]
primaryColor = "#6366f1"
backgroundColor = "#0f172a"
secondaryBackgroundColor = "#1e293b"
textColor = "#f1f5f9"

[server]
maxUploadSize = 200  # MB
```

## Troubleshooting

### Connection Issues
- Ensure backend API is running
- Check `API_URL` in secrets
- Verify CORS settings on backend

### Login Issues
- Verify credentials are correct
- Check backend auth endpoints
- Look at browser console for errors

### Page Not Loading
- Check Streamlit logs: `streamlit run app.py --logger.level=debug`
- Verify all dependencies are installed
- Clear browser cache

## Support

For issues or questions:
1. Check the backend API logs
2. Review Streamlit documentation: https://docs.streamlit.io
3. Check browser console for errors

## License

Same as main HireFlow project
