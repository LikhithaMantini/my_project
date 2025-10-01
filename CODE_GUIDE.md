# 📖 Code Guide - Understanding the PPT Maker

This guide explains how the code works so you can easily modify and extend it.

## 🏗️ Architecture Overview

```
Browser (React App)  ←→  Node.js Server  ←→  File System (JSON)
     app.js                server.js              data/*.json
```

## 📂 File Breakdown

### 1️⃣ **server.js** (Backend - 87 lines)

**Purpose**: REST API server for saving/loading presentations

**Key Sections**:
```javascript
// Lines 1-15: Setup
- Import Express, file system modules
- Define directories (data/, public/)
- Create data folder if missing

// Lines 17-22: Middleware
- CORS for cross-origin requests
- JSON parser (10mb limit)
- Serve static files from public/

// Lines 24-32: Helper function
- listPresentations(): Reads all .json files from data/

// Lines 34-87: API Routes
- GET /api/presentations → List all saved presentations
- GET /api/presentations/:id → Load specific presentation
- POST /api/presentations → Save/update presentation
- DELETE /api/presentations/:id → Delete presentation
- GET * → Serve index.html (SPA fallback)
```

**How to modify**:
- Change port: Line 7 `const PORT = 3001`
- Add new API: Add route before `app.get('*')`
- Change data folder: Line 9 `const DATA_DIR`

---

### 2️⃣ **public/index.html** (Frontend Shell - 23 lines)

**Purpose**: HTML shell that loads React and libraries from CDNs

**Key Sections**:
```html
Lines 9-15: CDN Scripts
- React 18 (development build)
- Babel standalone (JSX transpiler)
- Chart.js (for charts)
- PptxGenJS (for export)

Line 18: React mount point
- <div id="root"></div>

Line 20: Load app
- <script src="/app.js"></script>
```

**How to modify**:
- Add library: Add `<script>` tag in head
- Change React version: Update CDN URLs
- Production mode: Use `.production.min.js` CDN links

---

### 3️⃣ **public/app.js** (React App - 730 lines)

**Purpose**: Complete presentation editor with all features

#### **Data Model** (Lines 1-10)
```javascript
presentation = {
  id: string,
  name: string,
  theme: 'default' | 'dark',
  slides: [
    {
      id: string,
      background: '#ffffff',
      elements: [
        // Text element
        { id, type: 'text', x, y, w, h, rotation, 
          styles: { fontSize, color, fontWeight, fontStyle, textDecoration, textAlign },
          content: 'text' },
        
        // Image element
        { id, type: 'image', x, y, w, h, rotation, src: 'data:image/...' },
        
        // Chart element
        { id, type: 'chart', x, y, w, h, rotation, chartType: 'bar'|'line'|'pie',
          data: { labels: [], datasets: [{ label, values, color }] } },
        
        // Shape element
        { id, type: 'shape', x, y, w, h, rotation, shapeType: 'rect'|'circle'|'line',
          fill, stroke, strokeWidth }
      ]
    }
  ]
}
```

#### **Component Structure**
```
App (main component)
├── Toolbar (top controls)
├── Sidebar
│   ├── Navigation buttons (Prev/Next)
│   └── SlideThumb (for each slide)
├── Canvas (slide editor)
│   └── Elements (text/image/chart/shape)
│       ├── DragHandle (move)
│       └── ResizeHandles (resize)
└── Modals
    ├── LoadDialog (load presentations)
    └── ChartEditor (edit chart data)
```

#### **Key Functions** (Lines 11-730)

**Lines 12-25**: `defaultPresentation()`, `makeSlide()`
- Create new presentations and slides
- Apply templates (title, titleContent, blank)

**Lines 27-119**: `Toolbar` component
- All toolbar buttons and controls
- Conditional rendering based on selected element

**Lines 121-147**: `SlideThumb` component
- Slide thumbnails in sidebar
- Auto-scroll to active slide
- Duplicate/delete/reorder buttons

**Lines 149-171**: `ChartElement` component
- Renders charts using Chart.js
- Supports bar, line, pie types

**Lines 173-185**: `ShapeElement` component
- Renders SVG shapes (rect, circle, line)

**Lines 187-250**: `Canvas` component
- Main slide editing area
- Renders all elements
- Handles selection

**Lines 252-258**: `DragHandle` component
- Circular handle for moving elements

**Lines 260-269**: `ResizeHandles` component
- 4 corner handles for resizing

**Lines 271-297**: `LoadDialog` component
- Modal to load saved presentations

**Lines 299-353**: `ChartEditor` component
- Modal to edit chart data
- Multi-series support

**Lines 355-730**: `App` component (main logic)
- State management (presentation, history, selection)
- Event handlers for all actions
- Keyboard shortcuts
- Drag/resize logic
- Save/load/export functions

#### **State Management**
```javascript
// Main state
const [presentation, setPresentation] = useState(...)
const [currentSlide, setCurrentSlide] = useState(0)
const [selectedElementId, setSelectedElementId] = useState(null)

// History for undo/redo
const [history, setHistory] = useState([...])
const [historyIndex, setHistoryIndex] = useState(0)

// UI state
const [showLoad, setShowLoad] = useState(false)
const [showChartEditor, setShowChartEditor] = useState(false)
const [dragging, setDragging] = useState(null)
const [resizing, setResizing] = useState(null)
```

#### **Key Functions to Modify**

**Add new element type**:
```javascript
// 1. Update makeSlide() to include in templates
// 2. Add onAddNewElement() function
// 3. Add button in Toolbar
// 4. Add rendering in Canvas component
// 5. Add export logic in onExport()
```

**Add new toolbar control**:
```javascript
// 1. Add button in Toolbar component
// 2. Create handler function (onDoSomething)
// 3. Call updatePresentation() to modify state
```

**Add new keyboard shortcut**:
```javascript
// Find useEffect with handleKeyDown (line ~380)
// Add new case in the function
if (e.key === 'YourKey') {
  e.preventDefault();
  // Your logic
}
```

---

### 4️⃣ **public/styles.css** (Styling - 86 lines)

**Purpose**: Modern UI styling with gradients and animations

**Key Sections**:
```css
Lines 1-23: Global & Toolbar
- Purple gradient theme
- Button styles with hover effects
- Input and form controls

Lines 25-39: Sidebar
- Slide thumbnails
- Navigation buttons
- Custom scrollbar

Lines 41-58: Canvas & Elements
- Slide editing area
- Element borders and selection
- Drag/resize handles

Lines 60-81: Modals
- Dialog styling
- Animations (fadeIn, slideUp)
- Form layouts
```

**How to modify**:
- Change theme colors: Lines 3, 5, 15 (gradient colors)
- Adjust canvas size: Line 42 (960x540)
- Modify animations: Lines 61-63 (keyframes)

---

## 🔧 Common Modifications

### Change Slide Size
**app.js** - Line ~42:
```javascript
.canvas { width: 1280px; height: 720px; } // 16:9 HD
```

### Add New Chart Type
**app.js** - Lines 149-171 (ChartElement):
```javascript
// Chart.js supports: bar, line, pie, doughnut, radar, polarArea
const chart = new Chart(ctx, { type: 'doughnut', data, options });
```

### Change Default Font
**app.js** - Lines 241-246 (onAddText):
```javascript
styles: { fontSize: 24, color: '#000000', fontFamily: 'Arial' }
```

### Add Slide Transitions
**app.js** - Add in Canvas component:
```javascript
<div className="canvas" style={{ 
  animation: 'slideIn 0.3s ease-out'
}}>
```

---

## 🐛 Debugging Tips

### Check Browser Console
- Open DevTools (F12)
- Look for React errors or warnings
- Check network tab for API failures

### Check Server Logs
- Terminal shows all API requests
- Errors logged with details
- File save/load operations logged

### Common Issues

**"Cannot read property of undefined"**
- Check if element/slide exists before accessing
- Use optional chaining: `element?.styles?.fontSize`

**Elements not updating**
- Ensure updatePresentation() is called
- Check if state mutation is avoided (use JSON.parse/stringify)

**Export fails**
- Check browser console for PptxGenJS errors
- Verify all elements have valid data

---

## 📚 Libraries Used

### React 18
- **Hooks**: useState, useEffect, useRef, useCallback
- **Docs**: https://react.dev

### Chart.js
- **Types**: bar, line, pie
- **Docs**: https://www.chartjs.org

### PptxGenJS
- **Export**: Client-side PPTX generation
- **Docs**: https://gitbrent.github.io/PptxGenJS

### Express
- **Server**: REST API and static files
- **Docs**: https://expressjs.com

---

## 🎯 Next Steps

Want to add more features? Here are some ideas:

1. **Animations**: Slide transitions, element animations
2. **Collaboration**: Real-time editing with WebSockets
3. **Templates**: Pre-made slide designs
4. **Media**: Video/audio embedding
5. **Themes**: Color schemes and fonts
6. **Comments**: Add notes to slides
7. **Presenter Mode**: Full-screen with notes
8. **Grid/Guides**: Alignment helpers

---

## 📞 Need Help?

- Check README.md for usage instructions
- Review this guide for code structure
- Inspect browser console for errors
- Check server terminal for API logs

Happy coding! 🚀
