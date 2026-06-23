# ✅ Streamlit App - Verification Checklist

Use this to verify that everything is working correctly.

## 📋 Installation Verification

### ✓ Files Exist

```bash
# Run this command to verify all files are present
cd streamlit_app
ls -la                 # Linux/macOS
dir                    # Windows
```

**Should show:**
- ✅ `app.py`
- ✅ `requirements.txt`
- ✅ `Dockerfile`
- ✅ `.streamlit/config.toml`
- ✅ `.streamlit/secrets.example.toml`
- ✅ `pages/` directory
- ✅ `utils/` directory

### ✓ Dependencies Install

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Look for:** "Successfully installed streamlit, requests, pandas, plotly, etc."

### ✓ Secrets File

```bash
cp .streamlit/secrets.example.toml .streamlit/secrets.toml
```

**Verify:** `.streamlit/secrets.toml` now exists with:
```toml
API_URL = "http://localhost:5000/api"
```

## 🚀 Runtime Verification

### ✓ Backend Running

In Terminal 1:
```bash
cd backend
npm run dev
```

**Look for:** "Server is running on port 5000"

**Verify with curl:**
```bash
curl http://localhost:5000/api/jobs/public
# Should return JSON (might be empty array)
```

### ✓ Streamlit Running

In Terminal 2:
```bash
cd streamlit_app
streamlit run app.py
```

**Look for:**
```
You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://XXX.XXX.X.XXX:8501
```

**Browser should show:**
- HireFlow home page
- "Get Started" button
- "Browse Jobs" button

## 🔐 Feature Verification

### ✓ Register

1. Click "Register"
2. Fill in:
   - Company Name: `Test Company`
   - Company Email: `test@test.com`
   - Name: `Test User`
   - Email: `test@test.com`
   - Password: `TestPass123`
3. Click "Register"

**Should see:**
- ✅ Success message
- ✅ Redirect to dashboard
- ✅ User name in sidebar

### ✓ Dashboard

After login, should see:
- ✅ "📊 Pipeline Dashboard" title
- ✅ 4 metric cards (Total Candidates, Passed Screening, etc.)
- ✅ 4 pipeline columns (Applied, Assessment, Interview, Hired)
- ✅ Refresh button

### ✓ Job Management

1. Click "💼 Jobs" in sidebar
2. Click "➕ Post New Job"
3. Fill in:
   - Title: `Software Engineer`
   - Department: `Engineering`
   - Location: `New York`
   - Description: `Test job`
   - Requirements: `5+ years experience`
4. Click "📤 Post Job"

**Should see:**
- ✅ Success message
- ✅ Job appears in job list
- ✅ "1 candidates" count

### ✓ Candidates

1. Click "👥 Candidates" in sidebar

**Should see:**
- ✅ "Candidates" page loads
- ✅ Filter options (stage, sort, search)
- ✅ No candidates yet (or candidates if imported)

### ✓ Public Jobs

1. Click "🚪 Logout"
2. Page should show "Browse Jobs" button
3. Click "📋 Browse Jobs"

**Should see:**
- ✅ "📋 Available Jobs" title
- ✅ Search and filter boxes
- ✅ Job you just created
- ✅ "✉️ Apply" button

## 🔧 Configuration Verification

### ✓ Theme Colors

The app should display:
- ✅ Dark background
- ✅ Indigo/purple accent colors
- ✅ Light text on dark background
- ✅ All buttons have proper styling

### ✓ API Connection

1. Open browser developer console (F12)
2. Go to Network tab
3. Perform an action (login, create job)

**Should see:**
- ✅ API requests to `http://localhost:5000/api/...`
- ✅ 200 status codes for successful requests
- ✅ Response data in JSON format

## 🐛 Error Handling Verification

### ✓ API Error Handling

1. Stop the backend (Ctrl+C in Terminal 1)
2. Try to login in Streamlit

**Should see:**
- ✅ Error message displayed
- ✅ Not a crash or blank page
- ✅ App still responsive

### ✓ Validation

1. Try to register with:
   - Empty fields
   - Short password

**Should see:**
- ✅ Validation error message
- ✅ Clear instruction on what's wrong

## 📊 Performance Verification

### ✓ Page Load Time

- First load: 1-3 seconds (normal for Streamlit)
- Subsequent clicks: < 1 second

### ✓ No Memory Leaks

1. Perform 10 actions (click, enter, navigate)
2. Check browser tab memory usage

**Should see:**
- ✅ Stable memory usage
- ✅ No significant increase

## 🌐 Deployment Verification

### ✓ Docker Build

```bash
cd streamlit_app
docker build -t hireflow-streamlit .
```

**Should see:**
- ✅ "Successfully tagged hireflow-streamlit:latest"

### ✓ Docker Run

```bash
docker run -p 8501:8501 \
  -e API_URL=http://host.docker.internal:5000/api \
  hireflow-streamlit
```

**Should see:**
- ✅ Streamlit starts in container
- ✅ Accessible at http://localhost:8501

## ✨ UI/UX Verification

### ✓ Responsiveness

Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Should work on all sizes**

### ✓ Navigation

All buttons should work:
- [ ] Sidebar navigation
- [ ] Page routing
- [ ] Back/Forward in browser
- [ ] Direct URL access

### ✓ Forms

All forms should:
- [ ] Accept input
- [ ] Show validation errors
- [ ] Submit successfully
- [ ] Handle errors gracefully

## 🔒 Security Verification

### ✓ Authentication

1. Login as user
2. Close browser
3. Open new browser window

**Should require login again** ✅

### ✓ Protected Pages

1. Stop backend
2. Try to access dashboard

**Should show error, not expose data** ✅

### ✓ Secrets Not Exposed

1. Check `.streamlit/secrets.toml` not in git
2. Check API keys not in source code
3. Check no sensitive data in logs

## 📝 Verification Summary

Create a checklist and mark as you verify:

```
Installation
- [ ] All files present
- [ ] Dependencies installed
- [ ] Secrets file created

Runtime
- [ ] Backend running on 5000
- [ ] Streamlit running on 8501
- [ ] Home page loads

Features
- [ ] Register works
- [ ] Dashboard shows
- [ ] Job creation works
- [ ] Candidate list works
- [ ] Public jobs works

Configuration
- [ ] Theme colors correct
- [ ] API connection working
- [ ] Error handling works

Deployment
- [ ] Docker builds
- [ ] Docker runs

UX/Performance
- [ ] Responsive design
- [ ] Navigation works
- [ ] Fast performance
- [ ] Security verified
```

## 🆘 If Something's Wrong

| Issue | Check |
|-------|-------|
| App won't start | Python 3.9+? Dependencies installed? |
| API error | Backend running? API_URL correct? |
| Login fails | Backend auth endpoint working? |
| Page blank | Check browser console (F12) |
| Slow | First load slow? Try refresh |
| Docker fails | Dockerfile syntax? Port available? |

## ✅ All Verified!

When all checks pass:

1. ✅ Backend: http://localhost:5000
2. ✅ Frontend: http://localhost:8501
3. ✅ All features working
4. ✅ Error handling working
5. ✅ Ready to deploy

**You're ready to deploy to Streamlit Cloud!** 🚀
