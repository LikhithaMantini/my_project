# 🚀 Quick Start Guide - PPT Maker

## Getting Started

### 1. Start the Application
```bash
node server.js
```
The server will start at: **http://localhost:10000**

---

## ✨ New Features Overview

### 🎨 Font Selector
- **Location**: Toolbar (when text is selected)
- **Fonts Available**: Arial, Times New Roman, Courier New, Georgia, Verdana, Comic Sans MS, Impact, Trebuchet MS, Palatino, Garamond
- **How to Use**: Select text → Choose font from dropdown

### 📐 Actual Slide Size
- **New Size**: 960px × 720px (standard 4:3 aspect ratio)
- **Previous**: 960px × 540px
- **Benefit**: Matches real PowerPoint slide proportions

### 🔗 Share Presentations
- **Button**: "🔗 Share" in toolbar
- **Requirement**: Save presentation first
- **Result**: Get a shareable URL
- **Example**: `http://localhost:3001?presentation=1759304687178`

### ▶️ Present Mode
- **Button**: Green "▶️ Present" button
- **Features**: 
  - Full-screen black background
  - Professional slideshow view
  - Keyboard navigation
  - On-screen controls
  - Slide counter

**Keyboard Shortcuts in Present Mode:**
- `→` `↓` `Space` `PgDn` - Next slide
- `←` `↑` `PgUp` - Previous slide
- `Home` - First slide
- `End` - Last slide
- `Esc` - Exit presentation

### 📤 Export to PowerPoint
- **Button**: "📤 Export" in toolbar
- **Format**: .pptx (PowerPoint)
- **Includes**: All text formatting, images, charts, shapes, backgrounds
- **Status**: ✅ **FIXED AND WORKING!**

---

## 🎯 Common Workflows

### Creating a Presentation
1. Click "➕ Title" to add a title slide
2. Edit the title and subtitle text
3. Click "➕ Blank" or "➕ Title+Content" for more slides
4. Add elements: Text, Images, Charts, Shapes
5. Customize with colors, fonts, and formatting
6. Click "💾 Save" to save your work

### Formatting Text
1. Select a text element
2. Use toolbar controls:
   - **B** - Bold
   - **I** - Italic
   - **U** - Underline
   - Alignment buttons (Left/Center/Right)
   - Size input (8-96)
   - Color picker
   - **Font dropdown** (NEW!)

### Adding Charts
1. Click chart button (Bar/Line/Pie)
2. Chart editor opens automatically
3. Edit labels and data series
4. Add multiple series if needed
5. Click "Save"

### Presenting
1. Create your slides
2. Click "▶️ Present"
3. Navigate with keyboard or buttons
4. Press Esc when done

### Sharing
1. Click "💾 Save" first
2. Click "🔗 Share"
3. Copy the URL
4. Send to others
5. They can view (and edit if they want)

### Exporting
1. Click "📤 Export"
2. Wait for download
3. Open .pptx file in PowerPoint
4. All formatting preserved!

---

## ⌨️ Keyboard Shortcuts

### General
- `Ctrl+Z` - Undo
- `Ctrl+Y` or `Ctrl+Shift+Z` - Redo
- `Delete` or `Backspace` - Delete selected element
- `Arrow Keys` - Move selected element (1px)
- `Shift+Arrow Keys` - Move selected element (10px)
- `PageUp` - Previous slide
- `PageDown` - Next slide

### Presentation Mode
- `→` `↓` `Space` `PgDn` - Next
- `←` `↑` `PgUp` - Previous
- `Home` - First slide
- `End` - Last slide
- `Esc` - Exit

---

## 🎨 Design Tips

### Professional Presentations
1. **Consistent Fonts**: Stick to 1-2 font families
2. **Color Scheme**: Use complementary colors
3. **White Space**: Don't overcrowd slides
4. **Alignment**: Keep elements aligned
5. **Contrast**: Ensure text is readable

### Recommended Font Combinations
- **Professional**: Arial + Georgia
- **Modern**: Verdana + Trebuchet MS
- **Classic**: Times New Roman + Arial
- **Creative**: Impact + Palatino

### Slide Layouts
- **Title Slide**: Large title, smaller subtitle
- **Content Slide**: Title at top, bullet points or visuals below
- **Visual Slide**: Large image with minimal text
- **Data Slide**: Charts with brief explanation

---

## 🐛 Troubleshooting

### Export Not Working?
- ✅ **Fixed!** The export function has been completely rewritten
- Make sure you have elements on your slides
- Check browser console for any errors
- Try with a simple presentation first

### Share Link Not Working?
- Ensure you saved the presentation first
- Check that the server is running
- Verify the URL includes `?presentation=ID`

### Presentation Mode Issues?
- Press `Esc` to exit if stuck
- Refresh the page if needed
- Make sure you have at least one slide

### Elements Not Appearing?
- Check if they're outside the canvas bounds
- Try zooming out in your browser
- Verify the element is on the current slide

---

## 📊 Supported Features

### Text Elements
- ✅ Font family (10 options)
- ✅ Font size (8-96)
- ✅ Bold, Italic, Underline
- ✅ Text alignment (Left/Center/Right)
- ✅ Color picker
- ✅ Multi-line text

### Images
- ✅ Upload from computer
- ✅ Resize and position
- ✅ Rotate
- ✅ Export to PowerPoint

### Charts
- ✅ Bar charts
- ✅ Line charts
- ✅ Pie charts
- ✅ Multiple data series
- ✅ Custom colors
- ✅ Editable data

### Shapes
- ✅ Rectangles
- ✅ Circles/Ellipses
- ✅ Lines
- ✅ Fill color
- ✅ Stroke color & width

### Slides
- ✅ Multiple slides
- ✅ Reorder (move up/down)
- ✅ Duplicate
- ✅ Delete
- ✅ Background color
- ✅ Templates (Title, Title+Content, Blank)

---

## 🎉 You're All Set!

Start creating amazing presentations with your enhanced PPT Maker!

**Need Help?** Check the FEATURES_ADDED.md file for detailed technical information.

**Happy Presenting! 🎊**
