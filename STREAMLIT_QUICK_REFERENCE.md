# 🚀 HireFlow Streamlit - Quick Reference Card

## ⏱️ 5-Minute Start

### Step 1: Prepare Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
✅ Backend runs at `http://localhost:5000`

### Step 2: Setup Streamlit
```bash
cd streamlit_app
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .streamlit/secrets.example.toml .streamlit/secrets.toml
```

### Step 3: Configure
Edit `.streamlit/secrets.toml`:
```toml
API_URL = "http://localhost:5000/api"
```

### Step 4: Run
```bash
streamlit run app.py
```

✅ Frontend runs at `http://localhost:8501`

---

## 📊 What You Get

| Page | Purpose | Features |
|------|---------|----------|
| **Home** | Landing page | Overview, quick links |
| **Login** | Auth | Email/password login |
| **Register** | Auth | Company signup |
| **Dashboard** | Admin | Kanban pipeline, metrics |
| **Jobs** | Admin | Create, view, manage jobs |
| **Candidates** | Admin | Browse, filter, search candidates |
| **Public Jobs** | Candidate | Browse & apply for jobs |

---

## 🎯 File Locations

| What | Where |
|-----|-------|
| Main app | `streamlit_app/app.py` |
| Pages | `streamlit_app/pages/*.py` |
| API client | `streamlit_app/utils/api.py` |
| Config | `streamlit_app/.streamlit/config.toml` |
| Secrets | `streamlit_app/.streamlit/secrets.toml` (create from example) |
| Docs | `streamlit_app/README.md`, `DEPLOYMENT.md`, etc. |

---

## 🌐 Deploy to Streamlit Cloud (Free)

### Option A: Manual (Recommended for First Time)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Streamlit frontend"
   git push origin main
   ```

2. **Create Streamlit Account** → https://streamlit.io/cloud

3. **Deploy**
   - Click "Create app"
   - Select your GitHub repo
   - Set main file: `streamlit_app/app.py`
   - Click "Deploy"

4. **Configure Secrets**
   - In Streamlit Cloud dashboard
   - Settings → Secrets
   - Add: `API_URL = "https://your-backend-api.com/api"`

✅ Your app is live at `https://your-app-name.streamlit.app`

### Option B: Automated (If Using GitHub Actions)

See `DEPLOYMENT.md` for GitHub Actions workflow.

---

## 🔧 Common Tasks

### Change API URL
Edit `.streamlit/secrets.toml`:
```toml
API_URL = "http://localhost:5000/api"  # Local
API_URL = "https://api.example.com/api"  # Production
```

### Change Colors
Edit `.streamlit/config.toml`:
```toml
[theme]
primaryColor = "#FF6B6B"        # Your color
backgroundColor = "#1A1A2E"
textColor = "#FFFFFF"
```

### Add New Page

1. Create `streamlit_app/pages/newpage.py`
2. Add to `app.py` sidebar
3. Add routing in `app.py`

### Debug Connection Issues
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check API URL in secrets
3. Check browser console (F12)
4. Run with: `streamlit run app.py --logger.level=debug`

---

## 📱 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Backend not running. Run `npm run dev` in backend folder |
| "API error" | Check API_URL in `.streamlit/secrets.toml` |
| Page won't load | Clear cache: Ctrl+C, then `streamlit run app.py` |
| Login fails | Check backend auth endpoint in logs |
| Slow performance | First load is slow. Reload page. Caching helps. |

---

## 🔐 Security

✅ **What's Secure**
- JWT tokens stored in session state
- API calls use HTTPS in production
- Secrets never pushed to GitHub
- CORS protects API

⚠️ **What to Verify**
- Backend CORS allows Streamlit URL
- Secrets configured in Streamlit Cloud
- Backend uses HTTPS in production
- Environment variables are set

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `streamlit_app/README.md` | Full user guide |
| `streamlit_app/QUICKSTART.md` | 2-minute setup |
| `streamlit_app/DEPLOYMENT.md` | Streamlit Cloud guide |
| `streamlit_app/CONFIGURATION.md` | Advanced config |
| `STREAMLIT_SETUP.md` | Full architecture |
| `STREAMLIT_IMPLEMENTATION.md` | Implementation details |

---

## 🚀 Next Steps

### Phase 1: Local Testing (15 min)
- [ ] Backend running on port 5000
- [ ] Streamlit running on port 8501
- [ ] Login works
- [ ] Create test job
- [ ] View dashboard

### Phase 2: Deploy Backend (30 min)
- [ ] Choose provider (Render, Railway, Heroku)
- [ ] Deploy backend
- [ ] Get public API URL
- [ ] Enable HTTPS
- [ ] Test with curl

### Phase 3: Deploy Frontend (5 min)
- [ ] Push to GitHub
- [ ] Create Streamlit Cloud app
- [ ] Add API URL in secrets
- [ ] Test login
- [ ] Share URL with team

---

## 💡 Pro Tips

💡 **Pro Tip #1**: Streamlit hot-reloads on file save (if `runOnSave = true`)

💡 **Pro Tip #2**: Use `st.cache_data` to cache expensive API calls

💡 **Pro Tip #3**: Streamlit Cloud is free - no credit card needed!

💡 **Pro Tip #4**: Browser keyboard shortcut `R` reruns the app

💡 **Pro Tip #5**: Check logs with: `streamlit run app.py --logger.level=debug`

---

## 📞 Support Commands

```bash
# View all installed packages
pip list

# Check Streamlit version
streamlit --version

# Run with debug logging
streamlit run app.py --logger.level=debug

# Clear Streamlit cache
streamlit cache clear

# Show server info
streamlit run app.py --server.port=8501 --logger.level=info
```

---

## ✨ Features Summary

✅ Full authentication system  
✅ Job posting & management  
✅ Candidate pipeline (Kanban view)  
✅ Real-time candidate tracking  
✅ Search & filter  
✅ Responsive design  
✅ Dark theme  
✅ Mobile-friendly  
✅ Free Streamlit Cloud hosting  
✅ Automatic scaling  

---

## 📊 Architecture

```
┌─────────────────────────┐
│   Your Browser          │
└────────────┬────────────┘
             │ HTTPS
             ↓
┌─────────────────────────┐
│  Streamlit Cloud App    │
│ (https://app.streamlit.app)
└────────────┬────────────┘
             │ HTTP/REST API
             ↓
┌─────────────────────────┐
│   Backend (Node.js)     │
│ (https://api.domain.com)
└─────────────────────────┘
```

---

## 🎉 Done!

You now have:
- ✅ Complete Streamlit frontend
- ✅ Same features as Next.js app
- ✅ Free deployment ready
- ✅ Full documentation
- ✅ Easy scaling

**Everything is implemented and ready to use!**

Happy recruiting! 🚀
