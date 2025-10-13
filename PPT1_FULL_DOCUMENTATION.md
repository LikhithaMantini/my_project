# 📚 PPT1 Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
   1. [Slides & Elements](#slides--elements)
   2. [Editing Experience](#editing-experience)
   3. [Save, Share & Export](#save-share--export)
   4. [Recent Enhancements](#recent-enhancements)
   5. [Toolbar Redesign](#toolbar-redesign)
3. [Quick Start](#quick-start)
   1. [Run Locally](#run-locally)
   2. [Common Workflows](#common-workflows)
   3. [Keyboard Shortcuts](#keyboard-shortcuts)
   4. [Design Tips](#design-tips)
4. [Architecture & Code Guide](#architecture--code-guide)
   1. [System Architecture](#system-architecture)
   2. [File Breakdown](#file-breakdown)
   3. [Component Structure](#component-structure)
   4. [State Management](#state-management)
   5. [Extensibility Tips](#extensibility-tips)
5. [Deployment](#deployment)
   1. [Render (Recommended)](#render-recommended)
   2. [Other Platforms](#other-platforms)
   3. [Deployment Checklist](#deployment-checklist)
   4. [Post-Deployment Testing](#post-deployment-testing)
   5. [Persistence & Scaling](#persistence--scaling)
6. [Version Control Workflow](#version-control-workflow)
7. [Troubleshooting & Support](#troubleshooting--support)
8. [Roadmap Ideas](#roadmap-ideas)

---

## Project Overview
PPT Maker is a Google Slides-style presentation editor built with **React (loaded from CDN)** and a lightweight **Node.js/Express** backend (`server.js`). No bundlers or build steps are required—`public/index.html` loads all scripts directly.

### Project Structure
```
PPT1/
├── server.js           # Express API & static file server
├── package.json        # Dependencies & scripts
├── README.md           # Original overview (consolidated here)
├── data/               # Saved presentations (JSON)
└── public/
    ├── index.html      # React mount point
    ├── app.js          # Entire React application
    └── styles.css      # UI styling
```

---

## Key Features

### Slides & Elements
- **Templates**: Title, Title + Content, Blank.
- **Navigation**: Thumbnail clicks, arrow buttons, Page Up/Page Down keys.
- **Management**: Duplicate, delete, reorder slides; per-slide background colors.
- **Text**: Full styling (font family, size, bold, italic, underline, alignment, color).
- **Images**: Upload/embed via data URLs, resize, reposition.
- **Charts**: Bar, line, pie with multi-series support and editable data.
- **Shapes**: Rectangle, circle, line with fill, stroke color, and stroke width.

### Editing Experience
- Drag via ✥ handle; resize with corner handles.
- Keyboard nudging (1px or 10px with Shift).
- Undo/redo with Ctrl+Z / Ctrl+Y.
- Presentation name editing in toolbar header.
- Context-aware Format tab for selected elements.

### Save, Share & Export
- **Save/Load**: JSON documents in `data/` directory.
- **Share**: Generates URL pointing to saved presentation.
- **Present**: Full-screen slideshow with keyboard navigation and controls.
- **Export**: Downloads `.pptx` using PptxGenJS, preserving fonts, formatting, charts, shapes, and backgrounds.

### Recent Enhancements
- Font family selector with curated list (Arial, Times New Roman, Courier New, Georgia, Verdana, Comic Sans MS, Impact, Trebuchet MS, Palatino, Garamond).
- Slide canvas resizing to 960×720 (4:3) with updated thumbnails.
- Share dialog with copy-to-clipboard feedback.
- Present mode styling (glassmorphic controls, slide counter, keyboard support).
- Robust export logic with error handling and metadata.
- UI/UX refinements (spacing, shadows, gradients, modal polish).
- **Automatic bullets and numbering** with `listStyle` support and line spacing control.

### Toolbar Redesign
- Compact tabbed interface (File, Insert, Design, Format) reducing height by ~50%.
- Icon-first buttons with tooltips and section labels.
- Format tab appears when an element is selected, offering relevant controls:
  - Text: Bold, italic, underline, alignment, font size/color/family, spacing, bullets/numbers.
  - Shapes: Fill, stroke, stroke width.
  - Charts: Edit data dialog.
- Persistent Present button and presentation name input in header.

---

## Quick Start

### Run Locally
```bash
npm install
npm start
# or
node server.js
```
Open `http://localhost:10000` in your browser.

### Common Workflows
- **Create Presentation**: Add slides (Title, Title+Content, Blank) and populate with text, images, charts, shapes.
- **Format Text**: Select text, use toolbar controls (B/I/U, alignment, size, color, font dropdown, spacing, lists).
- **Add Charts**: Insert via Insert tab, edit labels/datasets in Chart Editor.
- **Present**: Click green “Present” button; navigate with keyboard/on-screen controls.
- **Share**: Save presentation, click “Share”, copy generated URL.
- **Export**: Click “Export” to download PowerPoint file.

### Keyboard Shortcuts
| Action | Shortcut |
| --- | --- |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Nudge / Nudge ×10 | Arrow keys / `Shift+Arrow` |
| Delete element | `Delete` or `Backspace` |
| Previous / Next slide | `PageUp` / `PageDown` |
| Present mode navigation | `→` `↓` `Space` `PgDn` / `←` `↑` `PgUp` |
| Present mode Home/End | `Home` / `End` |
| Exit present mode | `Esc` |

### Design Tips
- Limit to 1–2 fonts per presentation for consistency.
- Use complementary color schemes and maintain contrast.
- Leave sufficient white space; align elements neatly.
- Choose layout types (title, content, visual, data) based on message.

---

## Architecture & Code Guide

### System Architecture
```
Browser (React App) ←→ Node.js Server ←→ File System (data/*.json)
        public/app.js        server.js           Saved presentations
```

### File Breakdown
- **`server.js`**: Express server with CORS, JSON parsing, static serving, and REST endpoints (`GET/POST/DELETE /api/presentations`). Uses `process.env.PORT || 10000` and ensures `data/` exists.
- **`public/index.html`**: Minimal shell loading React 18, Babel, Chart.js, and PptxGenJS via CDN, mounting on `<div id="root">`.
- **`public/app.js`**: Entire React app (~700+ lines) managing toolbar, sidebar, canvas, elements, dialogs, history, export, present mode.
- **`public/styles.css`**: Gradient-based styling, responsive layout, thumbnails, modals, drag/resize handles.

### Component Structure
```
App
├── Toolbar (tabs: File, Insert, Design, Format)
├── Sidebar
│   └── SlideThumb (per slide)
├── Canvas
│   └── Elements (text/image/chart/shape)
│       ├── DragHandle
│       └── ResizeHandles
├── LoadDialog (modal)
└── ChartEditor (modal)
```

### State Management
```javascript
const [presentation, setPresentation] = useState(defaultPresentation());
const [currentSlide, setCurrentSlide] = useState(0);
const [selectedElementId, setSelectedElementId] = useState(null);
const [history, setHistory] = useState([...]);
const [historyIndex, setHistoryIndex] = useState(0);
const [showLoad, setShowLoad] = useState(false);
const [showChartEditor, setShowChartEditor] = useState(false);
const [presentMode, setPresentMode] = useState(false);
```
Undo/redo uses serialized snapshots stored in `history` with `historyIndex` tracking the active state.

### Extensibility Tips
- **Add element type**: Extend `makeSlide()`, create handler (`onAddX`), add toolbar button, render in `Canvas`, and support in `onExport()`.
- **Add toolbar control**: Add button in `Toolbar`, create handler that mutates element via `updatePresentation()`.
- **Add keyboard shortcut**: Update `handleKeyDown` effect to respond to new key combinations.
- **Modify styling**: Adjust colors in `styles.css`, tweak canvas size, or update animations.

---

## Deployment

### Render (Recommended)
Render supports Node services with free tier hosting. Deployment workflow:
1. **Prep repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PPT Maker"
   git remote add origin https://github.com/YOUR_USERNAME/ppt-maker.git
   git branch -M main
   git push -u origin main
   ```
2. **Create service** at [render.com](https://render.com):
   - Type: *Web Service*
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: Free
   - Auto-deploy on push (recommended)
3. **Optional** environment variables: `NODE_ENV=production`.
4. Wait for build, then access `https://<service-name>.onrender.com`.

#### Render Deployment Checklist
- `render.yaml` present (optional) with build/start commands and `PORT=10000`.
- `server.js` uses `process.env.PORT`.
- `package.json` lists dependencies (`express`, `cors`) and `start` script.
- `.gitignore` excludes `node_modules`, `data/*.json`, `.env`.
- Documentation updated and features tested locally.
- After deployment, verify create/load/save/export/share/present flows.

#### Render Troubleshooting
- **Application error**: Check logs; ensure start command matches `node server.js` and port usage.
- **Build failed**: Verify dependencies and Node version, test locally with `npm install && node server.js`.
- **Slow first load**: Free tier sleeps after 15 minutes idle; expect 30–60s cold starts.
- **Data loss**: Free tier storage is ephemeral; use database or persistent disk for production.

### Other Platforms
- **Railway**: Auto-detects Node app; free monthly credit.
- **Vercel**: Requires `vercel.json` to route Express server + static assets (storage ephemeral).
- **Heroku**: Requires Procfile `web: node server.js`; paid tiers only.
- **DigitalOcean App Platform**: Configure build `npm install`, run `npm start` (from $5/month).

### Deployment Checklist
- [ ] Code committed and pushed to GitHub.
- [ ] `package.json` includes all dependencies and `start` script.
- [ ] `server.js` uses `process.env.PORT || 10000`.
- [ ] `render.yaml` or platform config updated.
- [ ] Tested locally (`npm start`).
- [ ] Deployment build succeeded.
- [ ] Live URL reachable over HTTPS.

### Post-Deployment Testing
- Create slide deck with text, images, shapes, charts.
- Verify formatting controls (fonts, spacing, bullets/numbers).
- Save, load, and export to `.pptx`.
- Generate share link and ensure it loads saved presentation.
- Use Present mode to navigate through slides.

### Persistence & Scaling
- Free Render tier: Ephemeral storage, service sleeps after 15 minutes idle.
- Upgrade plan or attach persistent disk for reliable storage.
- For production or collaboration, integrate MongoDB Atlas or PostgreSQL and update `server.js` accordingly.
- Custom domains supported via Render settings with automatic HTTPS.

---

## Version Control Workflow

### Initial Push
```bash
git add .
git commit -m "Initial commit: PPT Maker with all features"
git remote add origin https://github.com/YOUR_USERNAME/ppt-maker.git
git branch -M main
git push -u origin main
```

### Subsequent Updates
```bash
git add .
git commit -m "Describe your changes"
git push
```

### Helpful Commands
```bash
git status             # Current changes
git log --oneline      # History
git checkout -b feature-name  # New branch
git checkout main      # Switch branch
git pull               # Sync latest
git remote -v          # View remotes
```

### Credential Tips
- Use GitHub Personal Access Token for HTTPS pushes.
- Or authenticate via GitHub CLI (`gh auth login`).

### Repository Hygiene
- `.gitignore` excludes `node_modules/`, `data/*.json`, `.env`.
- To remove accidentally committed dependencies: `git rm -r --cached node_modules`.

---

## Troubleshooting & Support

### Common Issues
- **Cannot read property of undefined**: Guard element/slide access with optional chaining (`element?.styles?.fontSize`).
- **Elements not updating**: Ensure `updatePresentation()` mutates within `setPresentation` callback.
- **Export failures**: Check browser console for PptxGenJS errors; verify elements have valid data.
- **Share link issues**: Presentation must be saved before sharing; ensure server is running.
- **Presentation mode stuck**: Press `Esc`; refresh if necessary.
- **Elements missing**: Confirm within canvas bounds; zoom out if needed.

### Debugging Steps
- Check browser DevTools console and network tab.
- Review server logs for API requests and errors.
- Confirm all files exist in `public/` when deploying.
- Inspect Render/Railway/Heroku logs for deployment failures.

### Support Resources
- Render Docs & Community: <https://render.com/docs>, <https://community.render.com>
- Chart.js Docs: <https://www.chartjs.org>
- PptxGenJS Docs: <https://gitbrent.github.io/PptxGenJS>
- React Docs: <https://react.dev>

---

## Roadmap Ideas
- Slide/Element animations.
- Real-time collaboration via WebSockets.
- Additional templates and themes.
- Media embedding (audio/video).
- Commenting/annotation system.
- Presenter notes and dual-screen mode.
- Gridlines/guides for alignment assistance.

---

**Happy presenting and building with PPT Maker!**
