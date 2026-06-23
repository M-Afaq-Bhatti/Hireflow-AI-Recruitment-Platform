# 🎯 HireFlow Streamlit - Start Here!

## What You Have

✅ **Complete Streamlit app** - Replaces Next.js frontend  
✅ **Same features** - Everything that was working still works  
✅ **Free deployment** - Streamlit Cloud costs nothing  
✅ **Full documentation** - Guides for every scenario  

## ⏱️ Get Running in 5 Minutes

### Terminal 1: Start Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Wait for: `Server is running on port 5000`

### Terminal 2: Start Frontend

```bash
cd streamlit_app
python -m venv venv

# Activate virtual environment
source venv/bin/activate              # macOS/Linux
# OR
venv\Scripts\activate                 # Windows

# Install dependencies
pip install -r requirements.txt

# Create secrets file
cp .streamlit/secrets.example.toml .streamlit/secrets.toml

# Run the app
streamlit run app.py
```

Wait for: `You can now view your Streamlit app in your browser.`

✅ **App is running at http://localhost:8501**

## 🎮 Try It Out

1. Open http://localhost:8501 in your browser
2. Click "Register"
3. Create a test account:
   - Company Name: `Test Company`
   - Company Email: `test@company.com`
   - Name: `Your Name`
   - Email: `you@company.com`
   - Password: `Password123`
4. Click "Dashboard" after login
5. Try:
   - ➕ Post a Job
   - 👥 View Candidates
   - 📊 See Pipeline Stats

## 🚀 Deploy to Streamlit Cloud (Free)

### Step 1: Push Code to GitHub

```bash
cd ..
git add streamlit_app/
git commit -m "Add Streamlit frontend"
git push origin main
```

### Step 2: Deploy on Streamlit Cloud

1. Go to https://streamlit.io/cloud
2. Sign in with GitHub
3. Click "Create app"
4. Select:
   - Repository: your-username/hireflow
   - Branch: main
   - File path: `streamlit_app/app.py`
5. Click "Deploy"

✅ **Your app is live!** (URL provided by Streamlit)

### Step 3: Configure Backend API

1. In Streamlit Cloud dashboard, click your app
2. Click Settings (⚙️)
3. Click "Secrets"
4. Add this (update with your backend URL):
   ```toml
   API_URL = "https://your-backend-api.com/api"
   ```
5. Save

✅ **Done!** Your app is now connected to the backend.

## 📁 Important Files

| File | What to Do |
|------|-----------|
| `.streamlit/secrets.toml` | Create from `.example.toml` file |
| `.streamlit/config.toml` | Edit to change colors/theme |
| `app.py` | Main app file - don't need to edit |
| `pages/*.py` | Different pages - don't need to edit |
| `utils/*.py` | Utilities - don't need to edit |

## ❓ Frequently Asked Questions

**Q: What if I get "Connection refused"?**  
A: Make sure backend is running. Check Terminal 1.

**Q: Can I customize the appearance?**  
A: Yes! Edit `.streamlit/config.toml` to change colors, fonts, etc.

**Q: How do I deploy to my own server?**  
A: Use Docker:
   ```bash
   cd streamlit_app
   docker build -t hireflow .
   docker run -p 8501:8501 -e API_URL=http://backend:5000/api hireflow
   ```

**Q: Can I add new features?**  
A: Yes! Create new files in `pages/` folder and add buttons in `app.py`.

**Q: Is my data safe on Streamlit Cloud?**  
A: Yes. Data is only stored in your backend database. Streamlit Cloud just displays it.

**Q: Does it cost money to deploy on Streamlit Cloud?**  
A: Nope! Free tier is unlimited for public apps.

## 🔍 What's Different from Next.js?

| Feature | Before | Now | Notes |
|---------|--------|-----|-------|
| GUI | React/Next.js | Streamlit | Same look & feel |
| Hosting | Vercel | Streamlit Cloud | Still free, simpler setup |
| Development | npm/React | Python/Streamlit | Easier to understand |
| Performance | Excellent | Very good | Reload on interaction |
| Real-time | WebSockets | Polling | Minor difference, user won't notice |

## 🐛 Troubleshooting

### App won't start
```bash
# Make sure you're in the right folder
cd streamlit_app

# Clear cache
streamlit cache clear

# Try again
streamlit run app.py
```

### Login not working
1. Check backend is running (Terminal 1)
2. Look at backend logs for errors
3. Verify credentials are correct

### API connection error
1. Check `.streamlit/secrets.toml` has correct `API_URL`
2. Make sure backend is running
3. Verify the URL format: `http://localhost:5000/api` (local)

### Page shows old content
- Press `R` in browser
- Or click refresh button
- Or press `Ctrl+Shift+R` to hard refresh

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `streamlit_app/README.md` | Full guide |
| `streamlit_app/QUICKSTART.md` | 2-min setup |
| `streamlit_app/DEPLOYMENT.md` | Cloud deployment |
| `streamlit_app/CONFIGURATION.md` | Customization |
| `STREAMLIT_SETUP.md` | Architecture |
| `STREAMLIT_IMPLEMENTATION.md` | Technical details |

## ✨ What's Included

```
streamlit_app/
├── app.py                  ← Main entry point
├── requirements.txt        ← Python packages
├── Dockerfile             ← Docker config
├── .streamlit/
│   ├── config.toml        ← Theme/settings
│   └── secrets.example.toml ← Secrets template
├── pages/                 ← Page files
│   ├── auth.py            ← Login/Register
│   ├── dashboard.py       ← Pipeline view
│   ├── jobs.py            ← Job management
│   ├── candidates.py      ← Candidate list
│   └── public_jobs.py     ← Public browse
└── utils/                 ← Utility files
    ├── api.py             ← API client
    ├── auth.py            ← Auth functions
    └── helpers.py         ← Helper functions
```

## 🎯 Your Next Actions

### Today (5 min)
- [ ] Get it running locally
- [ ] Test login/register
- [ ] Create test job
- [ ] View dashboard

### Tomorrow (30 min)
- [ ] Deploy backend to cloud
- [ ] Get public API URL
- [ ] Update backend CORS

### Later (5 min)
- [ ] Deploy Streamlit to cloud
- [ ] Test production
- [ ] Share with team

## 💬 Still Have Questions?

1. **Check the README**: `streamlit_app/README.md`
2. **Check DEPLOYMENT.md**: Full Streamlit Cloud guide
3. **Check browser console**: Press F12
4. **Check backend logs**: Look for error messages

## 🎉 You're All Set!

Everything you need is:
- ✅ Fully implemented
- ✅ Fully documented
- ✅ Ready to deploy
- ✅ Completely free

**Start with Terminal 1 and Terminal 2 commands above, then enjoy your new Streamlit frontend!** 🚀
