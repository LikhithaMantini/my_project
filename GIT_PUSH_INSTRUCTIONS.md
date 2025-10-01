# 🚀 Push to Git Repository

## Step-by-Step Instructions

### 1️⃣ Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `ppt-maker` (or your choice)
3. Description: "Google Slides-like presentation editor with React + Node.js"
4. Choose **Public** or **Private**
5. **Don't check** "Initialize with README"
6. Click **"Create repository"**
7. Copy the repository URL shown (looks like: `https://github.com/yourusername/ppt-maker.git`)

---

### 2️⃣ Run These Commands

Open terminal in the PPT1 folder and run:

```bash
# Add all files to git
git add .

# Commit with message
git commit -m "Initial commit: PPT Maker with all features"

# Add your GitHub repository as remote (replace with YOUR URL)
git remote add origin https://github.com/yourusername/ppt-maker.git

# Push to GitHub
git push -u origin main
```

**If you get an error about 'master' vs 'main':**
```bash
git branch -M main
git push -u origin main
```

---

### 3️⃣ If Asked for Credentials

**Option A: Use Personal Access Token (Recommended)**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "PPT Maker"
4. Check: `repo` (all repository permissions)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When prompted for password, paste the token

**Option B: Use GitHub CLI**
```bash
# Install GitHub CLI first: https://cli.github.com/
gh auth login
```

---

### 4️⃣ Verify Upload

1. Go to your GitHub repository URL
2. You should see all files:
   - server.js
   - package.json
   - README.md
   - CODE_GUIDE.md
   - public/ folder
   - .gitignore

---

## 🔄 Future Updates

After making changes, push updates with:

```bash
# Add changed files
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

---

## 📋 What Gets Pushed

✅ **Included:**
- server.js
- package.json
- README.md
- CODE_GUIDE.md
- public/ (index.html, app.js, styles.css)
- .gitignore

❌ **Excluded** (via .gitignore):
- node_modules/ (too large, can be reinstalled)
- data/*.json (user presentations)
- package-lock.json (auto-generated)

---

## 🌐 Clone on Another Computer

Anyone can clone your repository:

```bash
git clone https://github.com/yourusername/ppt-maker.git
cd ppt-maker
npm install
npm start
```

---

## 🔐 Make Repository Private

If you want to make it private later:
1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Choose "Make private"

---

## 📝 Quick Reference

```bash
# Check status
git status

# See commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# View remote URL
git remote -v
```

---

## ❓ Troubleshooting

**"fatal: not a git repository"**
```bash
git init
```

**"failed to push some refs"**
```bash
git pull origin main --rebase
git push
```

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin YOUR_URL
```

**Large file error**
- Check .gitignore includes node_modules/
- Run: `git rm -r --cached node_modules`

---

## 🎉 Done!

Your PPT Maker is now on GitHub! Share the link with others or deploy it to:
- Heroku
- Vercel
- Railway
- Render
- DigitalOcean

Happy coding! 🚀
