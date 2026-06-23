# Streamlit App - Configuration Guide

This guide explains how to configure and customize the Streamlit frontend.

## File Structure

```
streamlit_app/
├── app.py                         # Main entry point
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Docker container definition
├── .streamlit/
│   ├── config.toml               # Streamlit configuration
│   ├── secrets.toml              # Secrets (gitignored)
│   └── secrets.example.toml      # Secrets template
├── pages/
│   ├── auth.py                   # Login/Register pages
│   ├── dashboard.py              # Pipeline dashboard
│   ├── jobs.py                   # Job management
│   ├── candidates.py             # Candidate management
│   └── public_jobs.py            # Public job listings
└── utils/
    ├── api.py                    # API client
    ├── auth.py                   # Authentication utilities
    └── helpers.py                # Helper functions
```

## Configuration Files

### 1. .streamlit/config.toml

Controls Streamlit's behavior:

```toml
[theme]
primaryColor = "#6366f1"                 # Primary color
backgroundColor = "#0f172a"              # Background
secondaryBackgroundColor = "#1e293b"     # Secondary background
textColor = "#f1f5f9"                    # Text color
font = "sans serif"                      # Font family

[client]
showErrorDetails = true                  # Show full error messages
toolbarMode = "minimal"                  # Hide toolbar

[server]
port = 8501                              # App port
headless = true                          # No browser auto-open
runOnSave = true                         # Rerun on file save
maxUploadSize = 200                      # Max upload in MB
```

### 2. .streamlit/secrets.toml

Stores sensitive configuration:

```toml
# Create this file with your settings (don't commit to git)
API_URL = "http://localhost:5000/api"    # Backend API URL
```

**For Streamlit Cloud:** Add secrets via dashboard settings

## Customization

### Changing Colors

Edit `.streamlit/config.toml`:

```toml
[theme]
primaryColor = "#FF6B6B"        # Change primary color
backgroundColor = "#1A1A2E"     # Change background
textColor = "#FFFFFF"           # Change text color
```

### Changing API URL

**Local Development:**
```toml
# .streamlit/secrets.toml
API_URL = "http://localhost:5000/api"
```

**Production (Streamlit Cloud):**
```toml
# Set via Streamlit Cloud Dashboard
API_URL = "https://api.yourdomain.com/api"
```

### Customizing App Branding

Edit `app.py` to change:
- Page title: `st.set_page_config(page_title="...")`
- App name: Sidebar title
- Logo/branding: Sidebar markdown

## Environment Setup

### Option 1: Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate
source venv/bin/activate      # macOS/Linux
# or
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
```

### Option 2: Docker

```bash
# Build
docker build -t hireflow-streamlit .

# Run
docker run -p 8501:8501 \
  -e API_URL=http://localhost:5000/api \
  hireflow-streamlit
```

### Option 3: Streamlit Cloud

Push to GitHub, Streamlit Cloud handles everything!

## API Integration

### Adding New API Endpoints

Example: Adding a new endpoint in `pages/jobs.py`

```python
from utils.api import get_api_client

def show_example():
    api = get_api_client()
    
    # GET request
    response = api.get("/endpoint")
    
    # POST request
    response = api.post("/endpoint", json_data={"key": "value"})
    
    # PUT request
    response = api.put("/endpoint", json_data={"key": "value"})
    
    # DELETE request
    response = api.delete("/endpoint")
```

### Error Handling

The API client automatically handles:
- HTTP errors → `st.error()` display
- Connection errors → Error message
- JSON parsing errors → Graceful fallback

## Session State Management

The app uses `st.session_state` to maintain state:

```python
# Authentication
st.session_state.token          # JWT token
st.session_state.user           # Current user object
st.session_state.tenant_id      # Company ID

# Navigation
st.session_state.page           # Current page
st.session_state.selected_job_id # Selected job ID
st.session_state.selected_candidate_id  # Selected candidate
```

## Pages Guide

### `app.py` - Main Entry Point

Handles:
- Session initialization
- Page routing
- Authentication checks
- Sidebar navigation

### `pages/auth.py` - Authentication

Features:
- User registration (company + admin)
- User login
- Session management
- Error handling

### `pages/dashboard.py` - Pipeline Dashboard

Shows:
- Real-time candidate pipeline
- Key metrics (total, passed screening, etc.)
- Candidates by stage
- Quick actions

### `pages/jobs.py` - Job Management

Features:
- View job postings
- Create new jobs
- List all candidates per job
- Edit job details

### `pages/candidates.py` - Candidate Management

Features:
- Browse all candidates
- Filter by stage
- Search by name/email
- View candidate details
- Screening scores

### `pages/public_jobs.py` - Public Job Listings

For candidates:
- Browse open jobs (no auth required)
- Search and filter
- Apply for jobs
- View job details

## Utilities

### `utils/api.py` - API Client

`APIClient` class:
- Manages HTTP requests
- Handles authentication (JWT)
- Error handling
- Automatic token refresh

Usage:
```python
from utils.api import get_api_client

api = get_api_client()
response = api.get("/candidates")
```

### `utils/auth.py` - Authentication

Functions:
- `is_authenticated()` - Check if logged in
- `get_current_user()` - Get user object
- `login()` - Login with credentials
- `register()` - Register new account
- `logout()` - Sign out

### `utils/helpers.py` - Utilities

Functions:
- `format_stage()` - Format candidate stage with emoji
- `format_score()` - Format screening score
- `format_datetime()` - Format timestamps
- `get_score_color()` - Color for scores
- `paginate_list()` - Pagination helper

## Adding New Features

### 1. Create New Page

Create `pages/feature.py`:

```python
import streamlit as st
from utils.api import get_api_client
from utils.auth import require_auth

@require_auth()
def show_feature():
    st.markdown("## Feature Title")
    # Your code here

# Call this function from main app
```

### 2. Add to Navigation

Update `app.py` sidebar:

```python
if st.button("🎯 Feature Name"):
    st.session_state.page = "feature"
    st.rerun()
```

### 3. Add Routing

Update `app.py` main routing:

```python
elif st.session_state.page == "feature":
    from pages.feature import show_feature
    show_feature()
```

## Performance Optimization

### Caching

Use Streamlit's `@st.cache_data` decorator:

```python
@st.cache_data
def fetch_candidates():
    api = get_api_client()
    return api.get("/candidates")
```

### Large Lists

Use pagination in `utils/helpers.py`:

```python
from utils.helpers import paginate_list

items, page, total = paginate_list(candidates, page_size=10)
```

## Debugging

### Enable Debug Mode

```bash
streamlit run app.py --logger.level=debug
```

### View Session State

Add to any page:

```python
if st.checkbox("Show session state"):
    st.write(st.session_state)
```

### Check API Calls

```python
api = get_api_client()
try:
    response = api.get("/endpoint")
    st.write(response)  # Debug output
except Exception as e:
    st.error(f"Error: {str(e)}")
```

## Deployment Configuration

### Development
```toml
API_URL = "http://localhost:5000/api"
```

### Staging
```toml
API_URL = "https://staging-api.yourdomain.com/api"
```

### Production
```toml
API_URL = "https://api.yourdomain.com/api"
```

## Troubleshooting Configuration

### App won't start
- Check Python version (3.9+)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check `.streamlit/secrets.toml` syntax

### API connection fails
- Verify `API_URL` in secrets
- Check backend is running
- Verify CORS allows Streamlit URL

### Theme colors not applying
- Clear browser cache
- Restart Streamlit: `Ctrl+C`, then `streamlit run app.py`
- Verify `config.toml` syntax

## Advanced Configuration

### Custom CSS/HTML

In any page:

```python
st.markdown("""
<style>
    .custom-class {
        color: blue;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)
```

### Environment Variables

```python
import os

api_url = os.getenv("API_URL", "http://localhost:5000/api")
```

### Multi-user Support

Session state is already per-user. No additional configuration needed.

## Resources

- Config docs: https://docs.streamlit.io/library/develop/configuration
- API reference: https://docs.streamlit.io/library/api-reference
- Theme reference: https://docs.streamlit.io/library/develop/theming
