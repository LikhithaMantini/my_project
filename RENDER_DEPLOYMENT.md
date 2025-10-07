# 🚀 Deploy PPT Maker to Render

This guide will help you deploy your PPT Maker application to Render.com for free!

---

## 📋 Prerequisites

1. **GitHub Account** - You'll need to push your code to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free)
3. **Git installed** - To push your code

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd c:\Users\manti\OneDrive\Desktop\PPT1
git init
```

### 1.2 Add All Files

```bash
git add .
```

### 1.3 Commit Your Changes

```bash
git commit -m "Initial commit - PPT Maker with all features"
```

### 1.4 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Name it: `ppt-maker` (or any name you prefer)
4. **Don't** initialize with README (you already have files)
5. Click **Create repository**

### 1.5 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ppt-maker.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🌐 Step 2: Deploy to Render

### 2.1 Sign Up / Log In to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Authorize Render to access your GitHub repositories

### 2.2 Create New Web Service

1. Click **New +** button
2. Select **Web Service**
3. Connect your GitHub repository:
   - If not connected, click **Connect GitHub**
   - Find and select your `ppt-maker` repository
   - Click **Connect**

### 2.3 Configure Your Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `ppt-maker` (or your preferred name)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **Free** (or paid if you prefer)

**Advanced Settings (Optional):**
- **Auto-Deploy**: Yes (recommended - deploys on every push)

### 2.4 Environment Variables (Optional)

Click **Advanced** → **Add Environment Variable**:

- **Key**: `NODE_ENV`
- **Value**: `production`

### 2.5 Deploy!

1. Click **Create Web Service**
2. Wait for deployment (usually 2-5 minutes)
3. Watch the build logs in real-time

---

## ✅ Step 3: Verify Deployment

### 3.1 Check Build Logs

You should see:
```
==> Installing dependencies
==> npm install
==> Build successful
==> Starting service
Server running at http://localhost:10000
```

### 3.2 Access Your App

Once deployed, you'll get a URL like:
```
https://ppt-maker-xxxx.onrender.com
```

Click it to open your live application!

### 3.3 Test Features

- ✅ Create a presentation
- ✅ Add slides and elements
- ✅ Save presentation
- ✅ Export to PowerPoint
- ✅ Share functionality
- ✅ Present mode

---

## 📁 Files Created for Deployment

### `render.yaml`
Configuration file for Render (optional but recommended):
```yaml
services:
  - type: web
    name: ppt-maker
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Updated `server.js`
Changed default port from 3001 to 10000 (Render's default).

### Existing `.gitignore`
Already configured to exclude:
- `node_modules/`
- `data/*.json` (user presentations)
- `.env` files
- IDE files

---

## 🔄 Updating Your Deployment

After making changes to your code:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

If **Auto-Deploy** is enabled, Render will automatically:
1. Detect the push
2. Rebuild your application
3. Deploy the new version

---

## 💾 Data Persistence

### Important Notes:

⚠️ **Free Tier Limitation**: Render's free tier uses ephemeral storage, meaning:
- Saved presentations will be lost when the service restarts
- Service restarts after 15 minutes of inactivity

### Solutions:

#### Option 1: Use a Database (Recommended for Production)
Add MongoDB or PostgreSQL:
1. Create a free MongoDB Atlas account
2. Add database connection to your app
3. Store presentations in the database

#### Option 2: Use Render Disk (Paid)
Upgrade to a paid plan with persistent disk storage.

#### Option 3: Accept Ephemeral Storage
For demo/testing purposes, ephemeral storage is fine.

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- `package.json` has all dependencies
- No syntax errors in code
- Build logs for specific errors

**Solution:**
```bash
# Test locally first
npm install
node server.js
```

### App Crashes on Start

**Check:**
- Port configuration (should use `process.env.PORT`)
- Server logs in Render dashboard

**Solution:**
Verify `server.js` line 7:
```javascript
const PORT = process.env.PORT || 10000;
```

### 404 Errors

**Check:**
- All files in `public/` directory are committed
- `index.html`, `app.js`, `styles.css` exist

**Solution:**
```bash
git add public/
git commit -m "Add public files"
git push
```

### Slow Loading

**Reason:**
Free tier services spin down after inactivity.

**Solution:**
- First load may take 30-60 seconds
- Subsequent loads are fast
- Upgrade to paid tier for always-on service

---

## 🎯 Custom Domain (Optional)

### Add Your Own Domain

1. Go to your service settings
2. Click **Custom Domains**
3. Click **Add Custom Domain**
4. Enter your domain (e.g., `ppt.yourdomain.com`)
5. Update DNS records as instructed
6. Wait for SSL certificate (automatic)

---

## 📊 Monitoring

### View Logs

1. Go to Render dashboard
2. Select your service
3. Click **Logs** tab
4. See real-time application logs

### Metrics

Free tier includes:
- CPU usage
- Memory usage
- Request count
- Response times

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ GitHub auto-deploy
- ❌ Spins down after 15 min inactivity
- ❌ Ephemeral storage

### Paid Tier ($7/month):
- ✅ Always-on (no spin down)
- ✅ Persistent disk storage
- ✅ More resources
- ✅ Priority support

---

## 🔐 Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use Render's environment variables for:
- API keys
- Database credentials
- Secret tokens

### 2. CORS Configuration
Already configured in `server.js`:
```javascript
app.use(cors());
```

### 3. HTTPS
Render provides free SSL certificates automatically.

---

## 🚀 Advanced: CI/CD Pipeline

### Automatic Testing Before Deploy

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test # if you add tests
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Render Community](https://community.render.com)

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] All code committed to Git
- [ ] Pushed to GitHub
- [ ] `package.json` has all dependencies
- [ ] `server.js` uses `process.env.PORT`
- [ ] `.gitignore` excludes `node_modules/`
- [ ] `render.yaml` configured (optional)
- [ ] Tested locally with `npm start`

After deploying:

- [ ] Build completed successfully
- [ ] Service is running
- [ ] Can access the URL
- [ ] All features work
- [ ] Share feature generates correct URLs

---

## 🎉 You're Live!

Congratulations! Your PPT Maker is now deployed and accessible worldwide!

**Share your app:**
```
https://your-app-name.onrender.com
```

**Next Steps:**
1. Share with friends and colleagues
2. Gather feedback
3. Add new features
4. Consider upgrading for production use

---

## 📞 Support

If you encounter issues:

1. Check Render logs
2. Review this guide
3. Search [Render Community](https://community.render.com)
4. Contact Render support (paid plans)

Happy deploying! 🚀
