# Deployment Guide

This guide will help you deploy your AlgoPilotX Test Monitor to platforms that support Playwright browser automation.

## Prerequisites

- A GitHub account (to push your code)
- An account on Railway.app or Render.com (both have free tiers)

## Option 1: Deploy to Railway (Recommended - Easiest)

Railway automatically detects and deploys Docker applications.

### Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Dockerfile and deploy
   - Your app will be live at a Railway URL (e.g., `your-app.up.railway.app`)

3. **Configure Environment Variables (if needed):**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add any environment variables (like `SESSION_SECRET`)

**That's it!** Your tests will now run properly with full Playwright support.

---

## Option 2: Deploy to Render

Render also supports Docker deployments with free tier.

### Steps:

1. **Push your code to GitHub** (same as above)

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** algopilotx-test-monitor
     - **Environment:** Docker
     - **Region:** Choose closest to you
     - **Branch:** main
   - Click "Create Web Service"

3. **Configure Environment Variables:**
   - In Render dashboard, go to "Environment"
   - Add environment variables as needed

Your app will be live at `your-app.onrender.com`

---

## What Happens During Deployment

The `Dockerfile` handles everything:

1. ✅ Installs all system dependencies for Playwright
2. ✅ Downloads Chromium, Firefox, and WebKit browsers
3. ✅ Builds your application
4. ✅ Starts the server on port 5000

---

## Testing After Deployment

1. Visit your deployed URL
2. Navigate to **Test Suites**
3. Create and run a test
4. The test will execute successfully with full browser automation!

---

## Troubleshooting

**If tests still fail:**
- Check deployment logs in Railway/Render dashboard
- Verify the Dockerfile built successfully
- Ensure environment variables are set correctly

**Need help?**
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs

---

## Cost

Both platforms offer generous free tiers:
- **Railway:** $5 free credit per month
- **Render:** Free tier for web services (may have cold starts)

Your application should run well within free tier limits.
