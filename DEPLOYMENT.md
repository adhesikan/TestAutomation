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

3. **Configure Railway Settings:**
   
   After deployment, you need to generate a public URL:
   
   - In Railway dashboard, click on your deployed service
   - Go to the **Settings** tab
   - Scroll to **Networking** section
   - Click **Generate Domain** button
   - Railway will assign you a public URL (e.g., `your-app.up.railway.app`)
   - Wait 30-60 seconds for the domain to provision
   - Visit your URL!

4. **Add PostgreSQL Database (Required):**
   
   Your app needs a database to persist tests and results:
   
   - In Railway dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will automatically create a `DATABASE_URL` environment variable
   - Your app will automatically connect to the database
   - **No additional configuration needed!**

5. **Configure Additional Environment Variables (if needed):**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add any environment variables (like `SESSION_SECRET`)
   - Railway automatically sets `PORT` for you (don't set it manually)

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
4. ✅ Connects to PostgreSQL database for data persistence
5. ✅ Starts the server on port 5000

## Data Persistence

All your test configurations, test runs, and screenshots are stored in the PostgreSQL database:

- **Test Configurations** - Saved permanently, survive server restarts
- **Test Results** - Complete execution history with logs
- **Screenshots** - Failure screenshots stored as base64 in database
- **Schedules** - Cron-based test schedules persist across restarts

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
