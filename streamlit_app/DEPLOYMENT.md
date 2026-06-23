# Streamlit Cloud Deployment Guide

This guide explains how to deploy the HireFlow Streamlit app to Streamlit Cloud for free.

## Why Streamlit Cloud?

✅ **Free** - No hosting costs  
✅ **Easy** - Deploy directly from GitHub  
✅ **Fast** - Automatic deployments  
✅ **Scalable** - Handles traffic automatically  
✅ **Secure** - Built-in HTTPS and authentication  

## Prerequisites

1. GitHub account
2. Streamlit Cloud account (free at https://streamlit.io/cloud)
3. Backend API deployed and accessible publicly

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your GitHub repository has:
- `/streamlit_app/app.py` - Main entry point
- `/streamlit_app/requirements.txt` - Dependencies
- `.streamlit/config.toml` - Configuration
- `.gitignore` - To exclude secrets

**✓ All files are already prepared!**

### 2. Push to GitHub

```bash
cd /path/to/hireflow
git add streamlit_app/
git commit -m "Add Streamlit frontend"
git push origin main
```

### 3. Create Streamlit Account

1. Go to https://streamlit.io/cloud
2. Click "Sign up"
3. Sign in with GitHub
4. Grant permissions to your repository

### 4. Deploy Your App

1. In Streamlit Cloud, click "Create app"
2. Select:
   - **Repository**: your-username/hireflow
   - **Branch**: main
   - **Main file path**: streamlit_app/app.py
3. Click "Deploy"

Streamlit will automatically:
- Install dependencies from `requirements.txt`
- Run your app
- Give you a public URL (e.g., `https://your-app-name.streamlit.app`)

### 5. Configure Secrets

Streamlit Cloud needs to know your backend API URL:

1. In Streamlit Cloud dashboard, click your app
2. Click "Settings" (gear icon)
3. Click "Secrets"
4. Add your secrets:

```toml
API_URL = "https://your-backend-api.com/api"
```

**Important:** Never commit `secrets.toml` to GitHub. Streamlit handles secrets securely.

## Environment Configuration

### For Local Development

Create `.streamlit/secrets.toml`:
```toml
API_URL = "http://localhost:5000/api"
```

### For Streamlit Cloud

Use the Streamlit Cloud dashboard to add the same secrets.

## Backend API Configuration

Your backend API must:

1. **Be publicly accessible** at a domain (not localhost)
2. **Have CORS enabled** for your Streamlit Cloud URL
3. **Support HTTPS** (Streamlit Cloud requires HTTPS)

### Update Backend CORS

In your backend `server.js`, update CORS:

```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",           // Local development
    "https://your-app-name.streamlit.app"  // Streamlit Cloud
  ],
  credentials: true,
}));
```

## Deployment Checklist

- [ ] GitHub repository is public (or Streamlit has access)
- [ ] `streamlit_app/requirements.txt` includes all dependencies
- [ ] Backend API is deployed and publicly accessible
- [ ] Backend API has HTTPS enabled
- [ ] Backend CORS allows your Streamlit Cloud URL
- [ ] Secrets are configured in Streamlit Cloud dashboard
- [ ] App works locally before deploying

## Troubleshooting

### App fails to deploy

Check the deployment logs in Streamlit Cloud:
1. Click your app
2. Click "Manage app" → "Logs"
3. Look for errors

**Common issues:**
- Missing dependencies in `requirements.txt`
- Incorrect main file path
- Secrets not configured

### API connection errors

Verify:
1. Backend API is running and publicly accessible
2. `API_URL` secret is correct
3. Backend CORS allows your Streamlit Cloud URL
4. Network connectivity (no firewall blocks)

### Login not working

Check:
1. Backend auth endpoints are working
2. CORS headers are correct
3. Browser console for errors (press F12)
4. Backend logs for auth errors

### Slow performance

- Streamlit Cloud includes free resources; scale up as needed
- Cache expensive API calls
- Optimize database queries on backend
- Consider upgrading to Streamlit Community Cloud (paid tier)

## Updating Your App

1. Make changes to code locally
2. Test with `streamlit run app.py`
3. Commit and push to GitHub:
   ```bash
   git add streamlit_app/
   git commit -m "Update Streamlit app"
   git push origin main
   ```
4. Streamlit Cloud automatically redeploys within seconds

## Domain Setup (Optional)

Connect a custom domain (e.g., `hire.yourdomain.com`):

1. In Streamlit Cloud, go to "Settings" → "Custom domain"
2. Follow the DNS configuration steps
3. Your app is now available at your custom domain

## Cost

**Streamlit Cloud:**
- Free tier: Unlimited public apps
- Community Cloud: Pay-as-you-go (advanced features)
- Paid tier: $20/month for pro features

For most use cases, **free tier is sufficient**.

## Resources

- Streamlit Cloud Docs: https://docs.streamlit.io/deploy/streamlit-cloud
- Streamlit API Reference: https://docs.streamlit.io/library
- GitHub Pages: https://github.com

## Support

For deployment issues:
1. Check Streamlit Cloud logs
2. Review this guide
3. Check backend API logs
4. Ask in Streamlit Community Forums
