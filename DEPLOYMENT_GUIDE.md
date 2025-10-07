# 🚀 Deployment Guide - PPT Maker

## Best Deployment Options

Your app needs a Node.js server, so these platforms work best:

### 🏆 **Recommended: Render.com** (Easiest, Free Tier)
### ⚡ **Alternative 1: Railway.app** (Simple, Free Tier)
### 🔷 **Alternative 2: Vercel** (Popular, Free)
### 🟣 **Alternative 3: Heroku** (Classic, Paid)

---

## 1️⃣ Deploy to Render.com (RECOMMENDED)

**Why Render?**
- ✅ Free tier available
- ✅ Easy setup
- ✅ Auto-deploys from GitHub
- ✅ Persistent storage
- ✅ No credit card required

### **Steps:**

**A. Prepare Your Code**

1. Make sure you have a `package.json` with start script (already done ✓)
2. Ensure `server.js` uses `process.env.PORT` (already done ✓)

**B. Push to GitHub** (if not done yet)

```bash
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Commit
git add .
git commit -m "Initial commit: PPT Maker"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/ppt-maker.git
git push -u origin main
```

**C. Deploy on Render**

1. Go to: https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your `ppt-maker` repository
5. Configure:
   - **Name**: `ppt-maker` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deployment
8. Your app will be live at: `https://ppt-maker-xxxx.onrender.com`

**D. Access Your App**

Open the URL provided by Render. Done! 🎉

---

## 2️⃣ Deploy to Railway.app

**Why Railway?**
- ✅ Super simple
- ✅ Free $5/month credit
- ✅ Auto-deploys from GitHub
- ✅ Great developer experience

### **Steps:**

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `ppt-maker` repository
6. Railway auto-detects Node.js and deploys
7. Click **"Generate Domain"** to get a public URL
8. Your app is live at: `https://ppt-maker-production.up.railway.app`

**That's it!** Railway handles everything automatically.

---

## 3️⃣ Deploy to Vercel

**Why Vercel?**
- ✅ Very popular
- ✅ Free tier
- ✅ Fast deployments
- ✅ Great for Next.js (but works with Express too)

### **Steps:**

**A. Add Vercel Configuration**

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ]
}
```

**B. Deploy**

1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `ppt-maker` repository
5. Click **"Deploy"**
6. Your app is live at: `https://ppt-maker.vercel.app`

**Note**: Vercel has limitations with file storage. Saved presentations won't persist between deployments.

---

## 4️⃣ Deploy to Heroku

**Why Heroku?**
- ✅ Industry standard
- ✅ Reliable
- ❌ No free tier anymore (starts at $5/month)

### **Steps:**

**A. Install Heroku CLI**

Download from: https://devcenter.heroku.com/articles/heroku-cli

**B. Create Procfile**

Create `Procfile` (no extension) in project root:

```
web: node server.js
```

**C. Deploy**

```bash
# Login to Heroku
heroku login

# Create app
heroku create ppt-maker-yourname

# Push to Heroku
git push heroku main

# Open app
heroku open
```

Your app is live at: `https://ppt-maker-yourname.herokuapp.com`

---

## 5️⃣ Deploy to DigitalOcean App Platform

**Why DigitalOcean?**
- ✅ Reliable infrastructure
- ✅ $5/month tier
- ✅ Good for production apps

### **Steps:**

1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Connect GitHub and select repository
4. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3001 (or use environment variable)
5. Choose **Basic** plan ($5/month)
6. Click **"Launch App"**

---

## 📝 Pre-Deployment Checklist

Before deploying, make sure:

### ✅ **1. Environment Variables**

Your app should use `process.env.PORT` (already done ✓):

```javascript
const PORT = process.env.PORT || 3001;
```

### ✅ **2. Package.json Scripts**

Check `package.json` has start script (already done ✓):

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### ✅ **3. .gitignore**

Make sure these are ignored (already done ✓):

```
node_modules/
data/*.json
.env
```

### ✅ **4. Dependencies**

All dependencies in `package.json` (already done ✓):

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2"
  }
}
```

---

## 🗄️ Database for Presentations

Your app currently saves to `data/` folder. On most platforms, this won't persist.

### **Options for Persistent Storage:**

**Option 1: MongoDB Atlas (Free)**

```bash
npm install mongodb
```

Update `server.js` to use MongoDB instead of file system.

**Option 2: PostgreSQL (Render/Railway provide free tier)**

```bash
npm install pg
```

Store presentations as JSON in database.

**Option 3: Cloud Storage**

- AWS S3
- Google Cloud Storage
- Cloudinary

**For now**: Your app works fine, but presentations will reset on redeployment.

---

## 🌐 Custom Domain

After deploying, you can add a custom domain:

### **Render/Railway/Vercel:**
1. Go to project settings
2. Click "Custom Domains"
3. Add your domain (e.g., `pptmaker.com`)
4. Update DNS records as instructed

### **Domain Registrars:**
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

---

## 🔒 Environment Variables

If you add features that need secrets (API keys, database URLs):

### **Render:**
1. Go to Environment tab
2. Add key-value pairs
3. Redeploy

### **Railway:**
1. Go to Variables tab
2. Add variables
3. Auto-redeploys

### **Vercel:**
1. Project Settings → Environment Variables
2. Add variables
3. Redeploy

---

## 📊 Comparison Table

| Platform | Free Tier | Ease | Storage | Best For |
|----------|-----------|------|---------|----------|
| **Render** | ✅ Yes | ⭐⭐⭐⭐⭐ | Persistent | **Recommended** |
| **Railway** | ✅ $5 credit | ⭐⭐⭐⭐⭐ | Persistent | Quick deploys |
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐ | Temporary | Static/API |
| **Heroku** | ❌ $5/month | ⭐⭐⭐⭐ | Persistent | Production |
| **DigitalOcean** | ❌ $5/month | ⭐⭐⭐ | Persistent | Scalable apps |

---

## 🚀 Quick Deploy (Render - Recommended)

**5-Minute Deployment:**

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Render.com
# 3. New Web Service → Connect GitHub repo
# 4. Use these settings:
#    - Build: npm install
#    - Start: npm start
#    - Plan: Free
# 5. Deploy!

# Your app will be live in 2-3 minutes! 🎉
```

---

## 🐛 Troubleshooting

### **"Application Error" or "Cannot GET /"**

Check logs:
- Render: Click "Logs" tab
- Railway: Click "Deployments" → "View Logs"
- Heroku: `heroku logs --tail`

Common issues:
- Wrong start command (should be `npm start`)
- Missing dependencies in package.json
- Port not using `process.env.PORT`

### **Presentations Not Saving**

- File system storage doesn't persist on most platforms
- Use MongoDB or PostgreSQL for production
- Or accept that data resets on redeploy (fine for demo)

### **Build Failed**

- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Check build logs for specific errors

---

## 📱 Testing Deployed App

After deployment, test:

1. ✅ Create a presentation
2. ✅ Add text, images, shapes, charts
3. ✅ Save presentation
4. ✅ Load presentation
5. ✅ Export to PPTX
6. ✅ Undo/Redo works
7. ✅ All features functional

---

## 🎯 Recommended Workflow

**For Demo/Portfolio:**
→ Use **Render.com** (free, easy, works great)

**For Production:**
→ Use **Railway** or **Heroku** with database

**For Static + API:**
→ Use **Vercel** (but add database for persistence)

---

## 📞 Next Steps

1. **Deploy to Render** (easiest)
2. **Test all features**
3. **Share the link** on your portfolio/resume
4. **Optional**: Add custom domain
5. **Optional**: Add database for persistence

---

## 🎉 Your App is Ready to Deploy!

Choose a platform and follow the steps above. You'll have a live PPT Maker in minutes!

**Recommended**: Start with **Render.com** - it's free, easy, and works perfectly for this app.

Happy deploying! 🚀
