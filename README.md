# 📊 PPT Maker - Google Slides Clone

A full-featured presentation editor built with **React (CDN)** + **Node.js/Express**. No build step required!

## ✨ Features

### 🎨 Slides
- **Templates**: Title, Title+Content, Blank
- **Navigation**: Click thumbnails, ▲▼ buttons, Page Up/Down keys
- **Management**: Duplicate, delete, reorder slides
- **Customization**: Change background color per slide

### 📝 Elements
- **Text**: Bold, italic, underline, alignment, font size/color
- **Images**: Upload and embed (data URLs)
- **Charts**: Bar, Line, Pie with multi-series support
- **Shapes**: Rectangle, Circle, Line with fill/stroke

### ✏️ Editing
- **Drag**: Click ✥ handle to move elements
- **Resize**: Drag corner handles
- **Keyboard**: Arrow keys to nudge (Shift+Arrow = 10px)
- **Undo/Redo**: Ctrl+Z / Ctrl+Y

### 💾 Save & Export
- **Save/Load**: JSON format in `data/` folder
- **Export**: Download as PowerPoint (.pptx)

## 📁 Project Structure

```
PPT1/
├── server.js           # Backend API server (Express)
├── package.json        # Node.js dependencies
├── README.md          # This file
├── data/              # Saved presentations (auto-created)
└── public/            # Frontend files
    ├── index.html     # Main HTML (loads React from CDN)
    ├── app.js         # React app with all features
    └── styles.css     # UI styling
```

### 📄 File Descriptions

**`server.js`** (87 lines)
- Express server setup
- REST API endpoints for save/load/delete
- Serves static files from `public/`

**`public/index.html`** (23 lines)
- Loads React, Chart.js, PptxGenJS from CDNs
- Single `<div id="root">` for React app
- No build step needed!

**`public/app.js`** (730 lines)
- Complete React application
- All UI components and logic
- Handles: slides, elements, editing, save/export

**`public/styles.css`** (86 lines)
- Modern gradient design
- Toolbar, sidebar, canvas styling
- Drag handles and resize controls

## 🔌 API Endpoints
- **GET `/api/presentations`** → `{ items: [{ id, name, updatedAt }] }`
- **DELETE `/api/presentations/:id`** → Delete a saved presentation

## 🚀 Quick Start

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to:
   ```
   http://localhost:10000
   ```

### Deploy to Render

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed deployment instructions.

## 🎮 How to Use

### Creating Slides
- Click **➕ Title**, **➕ Title+Content**, or **➕ Blank**
- Manage slides: **⎘** duplicate, **✕** delete, **▲▼** reorder

### Adding Elements
- **📝 Text**: Click, type, format with B/I/U and alignment
- **🖼 Image**: Upload from your computer
- **📊📈🥧 Charts**: Bar/Line/Pie, click "✏ Edit Chart Data" to customize
- **▭⬤─ Shapes**: Rectangle/Circle/Line with fill/stroke controls

### Editing Elements
1. **Click** element to select
2. **Drag ✥ handle** to move
3. **Drag corners** to resize
4. **Arrow keys** to nudge (Shift = 10px)
5. **Delete key** to remove

### Keyboard Shortcuts
| Action | Shortcut |
|--------|----------|
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Nudge 1px | Arrow keys |
| Nudge 10px | Shift+Arrow |
| Delete | Delete/Backspace |
| Previous slide | Page Up |
| Next slide | Page Down |

### Save & Export
- **💾 Save**: Stores JSON in `data/` folder
- **📂 Load**: Opens saved presentations
- **📤 Export**: Downloads as .pptx file

## 💡 Technical Details

- **No build step**: React loaded from CDN
- **Images**: Stored as data URLs in JSON
- **Charts**: Rendered with Chart.js
- **Export**: Generated with PptxGenJS
- **Storage**: File-based JSON (no database needed)
