const { useState, useEffect, useRef, useMemo } = React;

// Debug function to check library availability
function checkLibraryStatus() {
  console.log('Library Status Check:');
  console.log('- PptxGenJS available:', typeof PptxGenJS !== 'undefined');
  console.log('- Chart.js available:', typeof Chart !== 'undefined');
  if (typeof PptxGenJS !== 'undefined') {
    console.log('- PptxGenJS version:', PptxGenJS.version || 'unknown');
  }
}

// Check libraries on page load
window.addEventListener('load', () => {
  setTimeout(checkLibraryStatus, 1000);
});

// Enhanced data model with shapes, themes, multi-series charts, text formatting
function uid(prefix = 'id') { return prefix + '_' + Math.random().toString(36).slice(2, 9); }

// Font families list
const FONT_FAMILIES = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 
  'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino', 'Garamond',
  'Helvetica', 'Calibri', 'Cambria', 'Consolas', 'Lucida Console',
  'Tahoma', 'Century Gothic', 'Book Antiqua', 'Arial Black', 'Franklin Gothic Medium'
];

const TOOLBAR_TABS = [
  { id: 'file', label: 'File' },
  { id: 'insert', label: 'Insert' },
  { id: 'design', label: 'Design' },
  { id: 'format', label: 'Format', requiresSelection: true },
];

const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Classic Light',
    description: 'Bright neutrals with charcoal text',
    slideBackground: '#ffffff',
    textColor: '#111111',
  },
  {
    id: 'midnight',
    name: 'Midnight Noir',
    description: 'Deep charcoal with soft contrast text',
    slideBackground: '#1f1f24',
    textColor: '#f5f6f7',
  },
  {
    id: 'ocean',
    name: 'Ocean Mist',
    description: 'Cool blues with crisp white typography',
    slideBackground: '#0f172a',
    textColor: '#f8fafc',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Glow',
    description: 'Warm gradient-inspired palette',
    slideBackground: '#fff7ed',
    textColor: '#1f2937',
  },
];

const THEMES = THEME_OPTIONS.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

// Searchable Font Dropdown Component
function FontDropdown({ value, onChange, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef();

  const filteredFonts = FONT_FAMILIES.filter(font =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (font) => {
    onChange(font);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="font-dropdown" ref={dropdownRef} style={{ position: 'relative', width: '140px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          padding: '6px 10px',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || 'Arial'}
        </span>
        <span>{isOpen ? '^' : 'v'}</span>
      </button>

      {isOpen && (
        <div
          style={
            {
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--color-panel)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
              zIndex: 1000,
              maxHeight: '220px',
              overflow: 'hidden',
            }
          }
        >
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '12px',
              outline: 'none',
              background: 'var(--color-surface-alt)',
              color: 'var(--color-text-primary)',
            }}
            autoFocus
          />
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {filteredFonts.map(font => (
              <div
                key={font}
                onClick={() => handleSelect(font)}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: font,
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: font === value ? 'var(--color-surface-alt)' : 'transparent',
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = font === value ? 'var(--color-surface-alt)' : 'transparent'}
              >
                {font}
              </div>
            ))}
            {filteredFonts.length === 0 && (
              <div style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center' }}>
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function defaultPresentation() {
  return {
    name: 'Untitled Presentation',
    theme: 'default',
    slides: [ makeSlide('title') ],
  };
}

function makeSlide(template = 'blank', theme = 'default') {
  const themeConfig = THEMES[theme] || THEMES.default;
  const slide = { id: uid('slide'), background: themeConfig.slideBackground, elements: [] };
  const textColor = themeConfig.textColor;
  if (template === 'title') {
    slide.elements.push({ id: uid('el'), type: 'text', x: 80, y: 180, w: 800, h: 100, rotation: 0, styles: { fontSize: 44, color: textColor, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', fontFamily: 'Arial', lineHeight: 1.2, listStyle: 'none' }, content: 'Click to add title' });
    slide.elements.push({ id: uid('el'), type: 'text', x: 80, y: 320, w: 800, h: 80, rotation: 0, styles: { fontSize: 24, color: textColor, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', fontFamily: 'Arial', lineHeight: 1.2, listStyle: 'none' }, content: 'Click to add subtitle' });
  } else if (template === 'titleContent') {
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 50, w: 840, h: 80, rotation: 0, styles: { fontSize: 32, color: textColor, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left', fontFamily: 'Arial', lineHeight: 1.2, listStyle: 'none' }, content: 'Click to add title' });
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 160, w: 840, h: 400, rotation: 0, styles: { fontSize: 18, color: textColor, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left', fontFamily: 'Arial', lineHeight: 1.4, listStyle: 'bullet' }, content: '• Click to add content\n• Add your key points here\n• Use bullet points for clarity' });
  }
  return slide;
}

function toNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeTextStyles(styles, themeConfig) {
  const defaultColor = themeConfig?.textColor || '#111111';
  return {
    fontSize: Number.isFinite(styles?.fontSize) ? styles.fontSize : 18,
    color: typeof styles?.color === 'string' ? styles.color : defaultColor,
    fontWeight: styles?.fontWeight === 'bold' ? 'bold' : 'normal',
    fontStyle: styles?.fontStyle === 'italic' ? 'italic' : 'normal',
    textDecoration: styles?.textDecoration === 'underline' ? 'underline' : 'none',
    textAlign: ['left', 'center', 'right', 'justify'].includes(styles?.textAlign) ? styles.textAlign : 'left',
    fontFamily: typeof styles?.fontFamily === 'string' && styles.fontFamily.trim() ? styles.fontFamily : 'Arial',
    lineHeight: Number.isFinite(styles?.lineHeight) ? styles.lineHeight : 1.4,
    listStyle: ['bullet', 'number', 'none'].includes(styles?.listStyle) ? styles.listStyle : 'none'
  };
}

function normalizeElement(element, themeConfig) {
  if (!element || typeof element !== 'object') return null;
  const base = {
    id: typeof element.id === 'string' ? element.id : uid('el'),
    type: element.type,
    x: toNumber(element.x, 100),
    y: toNumber(element.y, 120),
    w: toNumber(element.w, 400),
    h: toNumber(element.h, 200),
    rotation: toNumber(element.rotation, 0)
  };

  switch (element.type) {
    case 'text': {
      return {
        ...base,
        type: 'text',
        styles: normalizeTextStyles(element.styles, themeConfig),
        content: typeof element.content === 'string' ? element.content : ''
      };
    }
    case 'image': {
      return {
        ...base,
        type: 'image',
        src: typeof element.src === 'string' ? element.src : ''
      };
    }
    case 'chart': {
      const labels = Array.isArray(element.data?.labels) ? element.data.labels : ['Item 1', 'Item 2'];
      const datasets = Array.isArray(element.data?.datasets) && element.data.datasets.length > 0
        ? element.data.datasets.map((ds, idx) => ({
            label: typeof ds.label === 'string' ? ds.label : `Series ${idx + 1}`,
            values: Array.isArray(ds.values) && ds.values.length === labels.length ? ds.values : new Array(labels.length).fill(0),
            color: typeof ds.color === 'string' ? ds.color : '#4e79a7'
          }))
        : [{ label: 'Series 1', values: new Array(labels.length).fill(0), color: '#4e79a7' }];
      return {
        ...base,
        type: 'chart',
        chartType: ['bar', 'line', 'pie'].includes(element.chartType) ? element.chartType : 'bar',
        data: { labels, datasets }
      };
    }
    case 'shape': {
      return {
        ...base,
        type: 'shape',
        shapeType: ['rect', 'circle', 'line'].includes(element.shapeType) ? element.shapeType : 'rect',
        fill: typeof element.fill === 'string' ? element.fill : '#4e79a7',
        stroke: typeof element.stroke === 'string' ? element.stroke : '#000000',
        strokeWidth: toNumber(element.strokeWidth, 2)
      };
    }
    default:
      return null;
  }
}

function normalizePresentation(raw, { fallbackId } = {}) {
  if (!raw || typeof raw !== 'object') {
    const fallback = defaultPresentation();
    if (fallbackId) fallback.id = fallbackId;
    return fallback;
  }

  const clone = JSON.parse(JSON.stringify(raw));
  const normalized = { ...clone };

  normalized.id = typeof normalized.id === 'string' ? normalized.id : (fallbackId || `ppt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  normalized.name = typeof normalized.name === 'string' && normalized.name.trim() ? normalized.name : 'Untitled Presentation';
  normalized.theme = typeof normalized.theme === 'string' && THEMES[normalized.theme] ? normalized.theme : 'default';

  const themeConfig = THEMES[normalized.theme] || THEMES.default;

  if (!Array.isArray(normalized.slides) || normalized.slides.length === 0) {
    normalized.slides = [makeSlide('title', normalized.theme)];
  } else {
    normalized.slides = normalized.slides.map((slide) => {
      if (!slide || typeof slide !== 'object') return makeSlide('blank', normalized.theme);
      const elements = Array.isArray(slide.elements)
        ? slide.elements.map((el) => normalizeElement(el, themeConfig)).filter(Boolean)
        : [];
      return {
        id: typeof slide.id === 'string' ? slide.id : uid('slide'),
        background: typeof slide.background === 'string' ? slide.background : themeConfig.slideBackground,
        elements
      };
    }).filter(Boolean);
  }

  if (normalized.slides.length === 0) {
    normalized.slides = [makeSlide('blank', normalized.theme)];
  }

  return normalized;
}

// Compact Toolbar with icon-based tabs
function Toolbar({
  onAddSlide,
  onAddText,
  onAddImage,
  onAddChart,
  onAddShape,
  onDeleteElement,
  onChangeProp,
  selectedElement,
  onSave,
  onLoad,
  onExport,
  onShare,
  onPresent,
  presentationName,
  setPresentationName,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onChangeBackground,
  currentSlide,
  onEditChart,
  onApplyTheme,
  currentTheme,
  onApplyListStyle,
}) {
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState('file');
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const isText = selectedElement?.type === 'text';
  const isShape = selectedElement?.type === 'shape';
  const isChart = selectedElement?.type === 'chart';
  const prevSelectedTypeRef = useRef(null);
  const availableTabs = useMemo(
    () => TOOLBAR_TABS.filter(tab => !tab.requiresSelection || selectedElement),
    [selectedElement]
  );

  useEffect(() => {
    const prevType = prevSelectedTypeRef.current;
    const currentType = selectedElement?.type || null;

    if (currentType === 'text' && prevType !== 'text') {
      setActiveTab('format');
    } else if (!currentType && prevType === 'text') {
      setActiveTab('file');
    }

    prevSelectedTypeRef.current = currentType;
  }, [selectedElement]);

  useEffect(() => {
    if (!availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'file');
    }
  }, [activeTab, availableTabs]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'file' || tabId === 'insert' || tabId === 'design' || tabId === 'format') {
      setToolbarVisible(true);
    } else {
      setToolbarVisible(false);
    }
  };

  const renderFileTab = () => (
    <div className="toolbar-group file-toolbar-group">
      <div className="tool-section">
        <div className="file-menu-item" onClick={onSave} title="Save presentation" tabIndex={0} 
             onKeyDown={(e) => e.key === 'Enter' && onSave()}>
          <div className="file-menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
          </div>
          <div className="file-menu-content">
            <div className="file-menu-title">Save</div>
            <div className="file-menu-desc">Download as PowerPoint (.pptx)</div>
          </div>
        </div>
        <div className="file-menu-item" onClick={onExport} title="Export to PowerPoint">
          <div className="file-menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="12" rx="2" ry="2"/>
              <line x1="7" y1="8" x2="17" y2="8"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
              <line x1="7" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <div className="file-menu-content">
            <div className="file-menu-title">Export as PPTX</div>
            <div className="file-menu-desc">Download PowerPoint file</div>
          </div>
        </div>
        <div className="file-menu-item" onClick={onShare} title="Generate shareable link">
          <div className="file-menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
          <div className="file-menu-content">
            <div className="file-menu-title">Share</div>
            <div className="file-menu-desc">Generate shareable link</div>
          </div>
        </div>
        <div className="history-theme-inline">
          <div className="history-actions">
            <label className="section-label">History</label>
            <button onClick={onUndo} disabled={!canUndo} title="Undo">Undo</button>
            <button onClick={onRedo} disabled={!canRedo} title="Redo">Redo</button>
            <button onClick={onLoad} title="Open saved presentation">Open</button>
          </div>
          <div className="theme-actions">
            <label className="section-label">Themes</label>
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onApplyTheme(theme.id)}
                className={currentTheme === theme.id ? 'active' : ''}
                title={theme.description}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="toolbar-group">
      <div className="tool-section">
        <label className="section-label">Slides</label>
        <button onClick={() => onAddSlide('title')} title="Add a title slide">Title</button>
        <button onClick={() => onAddSlide('titleContent')} title="Add slide with body content">Title + Content</button>
        <button onClick={() => onAddSlide('blank')} title="Add blank slide">Blank</button>
      </div>
      <div className="tool-divider"></div>
      <div className="tool-section">
        <label className="section-label">Elements</label>
        <button onClick={onAddText} title="Insert text box">Text Box</button>
        <button onClick={() => fileRef.current && fileRef.current.click()} title="Upload an image">Image</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onAddImage(reader.result);
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className="tool-divider"></div>
      <div className="tool-section">
        <label className="section-label">Charts</label>
        <button onClick={() => onAddChart('bar')} title="Insert bar chart">Bar</button>
        <button onClick={() => onAddChart('line')} title="Insert line chart">Line</button>
        <button onClick={() => onAddChart('pie')} title="Insert pie chart">Pie</button>
      </div>
      <div className="tool-divider"></div>
      <div className="tool-section">
        <label className="section-label">Shapes</label>
        <button onClick={() => onAddShape('rect')} title="Insert rectangle">Rectangle</button>
        <button onClick={() => onAddShape('circle')} title="Insert circle">Circle</button>
        <button onClick={() => onAddShape('line')} title="Insert line">Line</button>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="toolbar-group">
      <div className="tool-section">
        <label className="section-label">Background</label>
        <input
          type="color"
          value={currentSlide?.background || '#ffffff'}
          onChange={(e) => onChangeBackground(e.target.value)}
          title="Slide background"
        />
        <button onClick={() => onChangeBackground('#ffffff')} title="Classic white background">Light</button>
        <button onClick={() => onChangeBackground('#000000')} title="Solid black background">Dark</button>
        <button onClick={() => onChangeBackground('#f2f2f2')} title="Soft gray background">Soft Gray</button>
      </div>
    </div>
  );

  const renderFormatTab = () => {
    if (!selectedElement) return null;
    return (
      <div className="toolbar-group">
        {isText && (
          <>
            <div className="tool-section">
              <label className="section-label">Text Style</label>
              <button
                onClick={() => onChangeProp('fontWeight', selectedElement.styles?.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={selectedElement.styles?.fontWeight === 'bold' ? 'active' : ''}
                title="Bold"
                style={{ fontWeight: 'bold' }}
              >
                B
              </button>
              <button
                onClick={() => onChangeProp('fontStyle', selectedElement.styles?.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={selectedElement.styles?.fontStyle === 'italic' ? 'active' : ''}
                title="Italic"
                style={{ fontStyle: 'italic' }}
              >
                I
              </button>
              <button
                onClick={() =>
                  onChangeProp(
                    'textDecoration',
                    selectedElement.styles?.textDecoration === 'underline' ? 'none' : 'underline'
                  )
                }
                className={selectedElement.styles?.textDecoration === 'underline' ? 'active' : ''}
                title="Underline"
                style={{ textDecoration: 'underline' }}
              >
                U
              </button>
            </div>
            <div className="tool-divider"></div>
            <div className="tool-section">
              <label className="section-label">Align</label>
              <button
                onClick={() => onChangeProp('textAlign', 'left')}
                className={selectedElement.styles?.textAlign === 'left' ? 'active' : ''}
                title="Align left"
              >
                Left
              </button>
              <button
                onClick={() => onChangeProp('textAlign', 'center')}
                className={selectedElement.styles?.textAlign === 'center' ? 'active' : ''}
                title="Align center"
              >
                Center
              </button>
              <button
                onClick={() => onChangeProp('textAlign', 'right')}
                className={selectedElement.styles?.textAlign === 'right' ? 'active' : ''}
                title="Align right"
              >
                Right
              </button>
            </div>
            <div className="tool-divider"></div>
            <div className="tool-section">
              <label className="section-label">Font</label>
              <input
                type="number"
                min="8"
                max="96"
                value={selectedElement.styles?.fontSize || 18}
                onChange={(e) => onChangeProp('fontSize', parseInt(e.target.value || '18', 10))}
                title="Font size"
                style={{ width: '60px' }}
              />
              <input
                type="color"
                value={selectedElement.styles?.color || '#111111'}
                onChange={(e) => onChangeProp('color', e.target.value)}
                title="Font color"
              />
              <FontDropdown
                value={selectedElement.styles?.fontFamily || 'Arial'}
                onChange={(font) => onChangeProp('fontFamily', font)}
                title="Font family"
              />
              <label className="section-label" style={{ marginLeft: '8px' }}>Spacing</label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={selectedElement.styles?.lineHeight ?? 1.2}
                onChange={(e) => onChangeProp('lineHeight', parseFloat(e.target.value) || 1.2)}
                title="Line spacing"
                style={{ width: '60px' }}
              />
            </div>
            <div className="tool-divider"></div>
            <div className="tool-section">
              <label className="section-label">Lists</label>
              <button
                onClick={() => onApplyListStyle('bullet')}
                className={selectedElement.styles?.listStyle === 'bullet' ? 'active' : ''}
                title="Toggle bullet list"
              >
                Bullets
              </button>
              <button
                onClick={() => onApplyListStyle('number')}
                className={selectedElement.styles?.listStyle === 'number' ? 'active' : ''}
                title="Toggle numbered list"
              >
                Numbers
              </button>
            </div>
          </>
        )}
        {isShape && (
          <>
            {(isText) && <div className="tool-divider"></div>}
            <div className="tool-section">
              <label className="section-label">Shape Style</label>
              <input
                type="color"
                value={selectedElement.fill || '#4e79a7'}
                onChange={(e) => onChangeProp('fill', e.target.value)}
                title="Fill color"
              />
              <input
                type="color"
                value={selectedElement.stroke || '#000000'}
                onChange={(e) => onChangeProp('stroke', e.target.value)}
                title="Stroke color"
              />
              <input
                type="number"
                min="0"
                max="20"
                value={selectedElement.strokeWidth || 2}
                onChange={(e) => onChangeProp('strokeWidth', parseInt(e.target.value || '2', 10))}
                title="Stroke width"
                style={{ width: '60px' }}
              />
            </div>
          </>
        )}
        {isChart && (
          <>
            {(isText || isShape) && <div className="tool-divider"></div>}
            <div className="tool-section">
              <button onClick={onEditChart} title="Edit chart data">Edit Chart Data</button>
            </div>
          </>
        )}
        {(isText || isShape || isChart) && <div className="tool-divider"></div>}
        <div className="tool-section">
          <button onClick={onDeleteElement} title="Remove selected element" className="delete-btn">
            Delete Element
          </button>
        </div>
      </div>
    );
  };

  const shouldShowToolbarContent = toolbarVisible || activeTab === 'format';

  return (
    <div className="toolbar-compact">
      <div className="toolbar-header">
        <div className="toolbar-tabs">
          {availableTabs.map((tab) => (
            <div
              key={tab.id}
              className={`toolbar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <input
          className="name-input-compact"
          value={presentationName}
          onChange={(e) => setPresentationName(e.target.value)}
          placeholder="Untitled presentation"
        />
        <button className="present-btn" onClick={onPresent} title="Present slideshow">
          Present
        </button>
      </div>

      {shouldShowToolbarContent && (
        <div className="toolbar-content">
          {activeTab === 'file' && renderFileTab()}
          {activeTab === 'insert' && renderInsertTab()}
          {activeTab === 'design' && renderDesignTab()}
          {activeTab === 'format' && renderFormatTab()}
        </div>
      )}
    </div>
  );
}

function SlideThumb({
  slide,
  index,
  total,
  active,
  onClick,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragEnd,
  isDragging,
  isDragOver,
}) {
  const thumbRef = useRef();
  const canMoveUp = index > 0;
  const canMoveDown = index < (total - 1);

  useEffect(() => {
    if (active && thumbRef.current) {
      thumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  const handleDragStart = (event) => {
    if (!onDragStart) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    onDragStart(index);
  };

  const handleDragOver = (event) => {
    if (!onDragOver) return;
    event.preventDefault();
    onDragOver(index);
  };

  const handleDrop = (event) => {
    if (!onDrop) return;
    event.preventDefault();
    onDrop(index);
  };

  const handleDragLeave = () => {
    if (onDragLeave) onDragLeave(index);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      ref={thumbRef}
      className={`slide-thumb${active ? ' active' : ''}${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <div className="slide-thumb-inner" style={{ background: slide.background, aspectRatio: '4/3' }} onClick={onClick}>
        {slide.elements.slice(0, 2).map(el => (
          <div key={el.id} className="thumb-el" />
        ))}
      </div>
      <div className="slide-num">{index + 1}</div>
      <div className="slide-actions">
        <button onClick={onDuplicate} title="Duplicate slide" className="slide-action-btn">⎘</button>
        <button onClick={onDelete} title="Delete slide" className="slide-action-btn delete">✕</button>
        {canMoveUp && (
          <button onClick={onMoveUp} title="Move slide up" className="slide-action-btn">▲</button>
        )}
        {canMoveDown && (
          <button onClick={onMoveDown} className="slide-action-btn">▼</button>
        )}
      </div>
    </div>
  );
}

function ChartElement({ element }) {
  const ref = useRef();
  useEffect(()=>{
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    ref.current._chart && ref.current._chart.destroy();
    const chartType = element.chartType || 'bar';
    const datasets = (element.data?.datasets || [{ label: 'Series', values: [3,5,2], color: '#4e79a7' }]).map(ds => ({
      label: ds.label || 'Series',
      data: ds.values || [],
      backgroundColor: chartType === 'pie' ? ['#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f'] : ds.color || '#4e79a7',
      borderColor: ds.color || '#4e79a7',
      borderWidth: 1,
    }));
    const data = { labels: element.data?.labels || ['A','B','C'], datasets };
    const options = { responsive: false, plugins: { legend: { display: datasets.length > 1 || chartType === 'pie' } }, scales: chartType !== 'pie' ? { y: { beginAtZero: true } } : {} };
    const chart = new Chart(ctx, { type: chartType, data, options });
    ref.current._chart = chart;
    return ()=> chart.destroy();
  }, [element]);
  return <canvas width={element.w} height={element.h} ref={ref} />;
}

function ShapeElement({ element }) {
  const { shapeType, fill, stroke, strokeWidth, w, h } = element;
  if (shapeType === 'rect') {
    return <svg width={w} height={h}><rect x={0} y={0} width={w} height={h} fill={fill||'#4e79a7'} stroke={stroke||'#000'} strokeWidth={strokeWidth||2} /></svg>;
  }
  if (shapeType === 'circle') {
    const r = Math.min(w,h)/2;
    return <svg width={w} height={h}><circle cx={w/2} cy={h/2} r={r-((strokeWidth||2)/2)} fill={fill||'#4e79a7'} stroke={stroke||'#000'} strokeWidth={strokeWidth||2} /></svg>;
  }
  if (shapeType === 'line') {
    return <svg width={w} height={h}><line x1={0} y1={h/2} x2={w} y2={h/2} stroke={stroke||'#000'} strokeWidth={strokeWidth||2} /></svg>;
  }
  return null;
}

function Canvas({ slide, selectedElementId, onSelect, onChangeText, onDragStart, onDragEnd, onResizeStart, onResizeEnd }) {
  return (
    <div className="canvas" style={{ background: slide.background, aspectRatio: '4/3', width: '960px', height: '720px' }}>
      {slide.elements.map(el => {
        const style = { left: el.x, top: el.y, width: el.w, height: el.h, transform: `rotate(${el.rotation||0}deg)` };
        const selected = el.id === selectedElementId;
        const commonProps = { onClick: (e)=>{ e.stopPropagation(); onSelect(el.id); } };
        if (el.type === 'text') {
          return (
            <div key={el.id} className={"el text-el" + (selected?' selected':'')} style={style} {...commonProps}>
              <textarea value={el.content} onChange={e=>onChangeText(el.id, e.target.value)} style={{
                fontSize: el.styles?.fontSize,
                color: el.styles?.color,
                fontWeight: el.styles?.fontWeight,
                fontStyle: el.styles?.fontStyle,
                textDecoration: el.styles?.textDecoration,
                textAlign: el.styles?.textAlign,
                fontFamily: el.styles?.fontFamily || 'Arial',
                lineHeight: el.styles?.lineHeight || 1.2,
              }} />
              {selected && <ResizeHandles onResizeStart={(dir)=>onResizeStart(el.id, dir)} />}
              {selected && <DragHandle onDragStart={()=>onDragStart(el.id)} />}
            </div>
          );
        }
        if (el.type === 'image') {
          return (
            <div key={el.id} className={"el image-el" + (selected?' selected':'')} style={style} {...commonProps}>
              <img src={el.src} alt="" draggable={false} />
              {selected && <ResizeHandles onResizeStart={(dir)=>onResizeStart(el.id, dir)} />}
              {selected && <DragHandle onDragStart={()=>onDragStart(el.id)} />}
            </div>
          );
        }
        if (el.type === 'chart') {
          return (
            <div key={el.id} className={"el chart-el" + (selected?' selected':'')} style={style} {...commonProps}>
              <ChartElement element={el} />
              {selected && <ResizeHandles onResizeStart={(dir)=>onResizeStart(el.id, dir)} />}
              {selected && <DragHandle onDragStart={()=>onDragStart(el.id)} />}
            </div>
          );
        }
        if (el.type === 'shape') {
          return (
            <div key={el.id} className={"el shape-el" + (selected?' selected':'')} style={style} {...commonProps}>
              <ShapeElement element={el} />
              {selected && <ResizeHandles onResizeStart={(dir)=>onResizeStart(el.id, dir)} />}
              {selected && <DragHandle onDragStart={()=>onDragStart(el.id)} />}
            </div>
          );
        }
        return null;
      })}
      <div className="canvas-overlay" onClick={()=>onSelect(null)} />
    </div>
  );
}

function DragHandle({ onDragStart }) {
  return <div className="drag-handle" onMouseDown={onDragStart} title="Drag to move">Move</div>;
}

function ResizeHandles({ onResizeStart }) {
  return (
    <>
      <div className="resize-handle nw" onMouseDown={()=>onResizeStart('nw')} />
      <div className="resize-handle ne" onMouseDown={()=>onResizeStart('ne')} />
      <div className="resize-handle sw" onMouseDown={()=>onResizeStart('sw')} />
      <div className="resize-handle se" onMouseDown={()=>onResizeStart('se')} />
    </>
  );
}

function LoadDialog({ onClose, onLoadId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      // Load presentations from localStorage
      const localPresentations = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('presentation_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            const id = key.replace('presentation_', '');
            localPresentations.push({
              id: id,
              name: data.name || 'Untitled Presentation',
              updatedAt: data.createdAt || new Date().toISOString(),
              slides: data.slides?.length || 0
            });
          } catch (parseErr) {
            console.warn('Failed to parse presentation:', key, parseErr);
          }
        }
      }
      
      if (localPresentations.length > 0) {
        // Sort by creation date (newest first)
        localPresentations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setItems(localPresentations);
        setError(null);
      } else {
        setItems([]);
        setError(null);
      }
      
      // Also try to fetch from API if available (fallback)
      fetch('/api/presentations')
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('API not available');
        })
        .then(d => {
          const apiItems = d.items || [];
          // Merge with local items, avoiding duplicates
          const mergedItems = [...localPresentations];
          apiItems.forEach(apiItem => {
            if (!mergedItems.find(item => item.id === apiItem.id)) {
              mergedItems.push(apiItem);
            }
          });
          setItems(mergedItems);
        })
        .catch(() => {
          // API not available, use only local presentations
          console.log('API not available, using local presentations only');
        });
        
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load presentations from local storage.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="modal">
      <div className="modal-body">
        <h3>Load Presentation</h3>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
            Loading presentations...
          </div>
        )}
        {error && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--color-text-primary)',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '6px',
              margin: '10px 0',
              border: '1px solid var(--color-border)',
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="list">
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                No saved presentations found. Create and save a presentation first.
              </div>
            ) : (
              items.map(it => (
                <div key={it.id} className="list-item">
                  <div>
                    <div className="name">{it.name || 'Untitled Presentation'}</div>
                    <div className="meta">
                      {it.slides && <span>{it.slides} slides - </span>}
                      {it.updatedAt && (
                        <span>Saved: {new Date(it.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onLoadId(it.id)}>Open</button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this presentation?')) {
                          localStorage.removeItem(`presentation_${it.id}`);
                          setItems(items.filter(item => item.id !== it.id));
                        }
                      }}
                      style={{ background: '#dc2626', borderColor: '#dc2626' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <div className="actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ChartEditor({ element, onUpdate, onClose }) {
  const [chartType, setChartType] = useState(element.chartType || 'bar');
  const [labels, setLabels] = useState((element.data?.labels||['A','B','C']).join(','));
  const [datasets, setDatasets] = useState(element.data?.datasets || [{ label: 'Series 1', values: [3,5,2], color: '#4e79a7' }]);
  
  function addDataset() {
    setDatasets([...datasets, { label: `Series ${datasets.length+1}`, values: labels.split(',').map(()=>0), color: '#f28e2c' }]);
  }
  function removeDataset(idx) {
    setDatasets(datasets.filter((_,i)=>i!==idx));
  }
  function updateDataset(idx, field, value) {
    const next = [...datasets];
    if (field === 'values') {
      // Better parsing with validation
      const values = value.split(',').map(s => {
        const num = parseFloat(s.trim());
        return isNaN(num) ? 0 : num;
      });
      next[idx].values = values;
    } else {
      next[idx][field] = value;
    }
    setDatasets(next);
  }
  
  return (
    <div className="modal">
      <div className="modal-body chart-editor">
        <h3>Edit Chart</h3>
        <label>Chart Type</label>
        <select value={chartType} onChange={e=>setChartType(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
        <label>Labels (comma-separated)</label>
        <input 
          value={labels} 
          onChange={e=>{
            setLabels(e.target.value);
            // Update dataset values to match label count
            const labelCount = e.target.value.split(',').filter(l => l.trim()).length;
            setDatasets(prev => prev.map(ds => ({
              ...ds,
              values: ds.values.length === labelCount ? ds.values : 
                      Array(labelCount).fill(0).map((_, i) => ds.values[i] || 0)
            })));
          }} 
          placeholder="e.g., Q1, Q2, Q3, Q4"
        />
        <h4>Data Series</h4>
        {datasets.map((ds, i) => (
          <div key={i} className="dataset-row">
            <input placeholder="Label" value={ds.label} onChange={e=>updateDataset(i,'label',e.target.value)} />
            <input placeholder="Values (comma-sep)" value={ds.values.join(',')} onChange={e=>updateDataset(i,'values',e.target.value)} />
            <input type="color" value={ds.color} onChange={e=>updateDataset(i,'color',e.target.value)} />
            <button onClick={()=>removeDataset(i)}>✕</button>
          </div>
        ))}
        <button onClick={addDataset}>+ Add Series</button>
        <div className="actions">
          <button onClick={()=>{
            const lbls = labels.split(',').map(s=>s.trim()).filter(Boolean);
            onUpdate({ chartType, data: { labels: lbls, datasets } });
            onClose();
          }}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [presentation, setPresentation] = useState(defaultPresentation());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [history, setHistory] = useState([JSON.stringify(defaultPresentation())]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLoad, setShowLoad] = useState(false);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [presentMode, setPresentMode] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [draggingSlideIndex, setDraggingSlideIndex] = useState(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState(null);
  
  const selectedSlide = presentation.slides[currentSlide];
  const selectedElement = selectedSlide?.elements.find(e=>e.id===selectedElementId) || null;

  // Load presentation from URL query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presentationId = params.get('presentation');
    if (!presentationId) return;

    const localKey = `presentation_${presentationId}`;

    const applyPresentation = (data) => {
      if (!data || !Array.isArray(data.slides)) {
        throw new Error('Invalid presentation data');
      }
      setPresentation(data);
      setCurrentSlide(0);
      setSelectedElementId(null);
      setHistory([JSON.stringify(data)]);
      setHistoryIndex(0);
    };

    try {
      const storedData = localStorage.getItem(localKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const normalized = normalizePresentation(parsed, { fallbackId: presentationId });
        setPresentation(normalized);
        setCurrentSlide(0);
        setSelectedElementId(null);
        setHistory([JSON.stringify(normalized)]);
        setHistoryIndex(0);
        return;
      }
    } catch (err) {
      console.error('Failed to read local presentation cache:', err);
    }

    (async () => {
      try {
        const response = await fetch(`/api/presentations/${encodeURIComponent(presentationId)}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Presentation not found' : 'Failed to load presentation');
        }
        const data = await response.json();
        const normalized = normalizePresentation(data, { fallbackId: presentationId });
        setPresentation(normalized);
        setCurrentSlide(0);
        setSelectedElementId(null);
        setHistory([JSON.stringify(normalized)]);
        setHistoryIndex(0);
        try {
          localStorage.setItem(localKey, JSON.stringify(normalized));
        } catch (err) {
          console.warn('Unable to cache shared presentation locally:', err);
        }
      } catch (err) {
        console.error('Failed to load shared presentation:', err);
        alert('Unable to load the shared presentation. Please check the link and try again.');
      }
    })();
  }, []);

  function saveHistory(newPresentation) {
    const serialized = JSON.stringify(newPresentation);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(serialized);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function updatePresentation(mutator, saveToHistory = true) {
    setPresentation(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      mutator(next);
      if (saveToHistory) saveHistory(next);
      return next;
    });
  }

  function onUndo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPresentation(JSON.parse(history[newIndex]));
      setSelectedElementId(null);
    }
  }

  function onRedo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPresentation(JSON.parse(history[newIndex]));
      setSelectedElementId(null);
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      }
      if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          onDeleteElement();
        }
      }
      if (selectedElementId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          updatePresentation(p => {
            const el = p.slides[currentSlide].elements.find(e=>e.id===selectedElementId);
            if (!el) return;
            if (e.key === 'ArrowUp') el.y -= step;
            if (e.key === 'ArrowDown') el.y += step;
            if (e.key === 'ArrowLeft') el.x -= step;
            if (e.key === 'ArrowRight') el.x += step;
          });
        }
      }
      // Slide navigation with PageUp/PageDown
      if (e.key === 'PageUp' && currentSlide > 0) {
        e.preventDefault();
        setCurrentSlide(currentSlide - 1);
        setSelectedElementId(null);
      }
      if (e.key === 'PageDown' && currentSlide < presentation.slides.length - 1) {
        e.preventDefault();
        setCurrentSlide(currentSlide + 1);
        setSelectedElementId(null);
      }
      // Quick shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      if (e.key === 'F5') {
        e.preventDefault();
        onPresent();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddSlide('blank');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, historyIndex, history, currentSlide, presentation.slides.length]);

  useEffect(() => {
    if (!dragging && !resizing) return;
    function handleMouseMove(e) {
      if (dragging) {
        updatePresentation(p => {
          const el = p.slides[currentSlide].elements.find(e=>e.id===dragging.id);
          if (!el) return;
          el.x = dragging.startX + (e.clientX - dragging.mouseX);
          el.y = dragging.startY + (e.clientY - dragging.mouseY);
        }, false);
      }
      if (resizing) {
        updatePresentation(p => {
          const el = p.slides[currentSlide].elements.find(e=>e.id===resizing.id);
          if (!el) return;
          const dx = e.clientX - resizing.mouseX;
          const dy = e.clientY - resizing.mouseY;
          if (resizing.dir === 'se') {
            el.w = Math.max(20, resizing.startW + dx);
            el.h = Math.max(20, resizing.startH + dy);
          } else if (resizing.dir === 'nw') {
            const newW = Math.max(20, resizing.startW - dx);
            const newH = Math.max(20, resizing.startH - dy);
            el.x = resizing.startX + (resizing.startW - newW);
            el.y = resizing.startY + (resizing.startH - newH);
            el.w = newW;
            el.h = newH;
          } else if (resizing.dir === 'ne') {
            el.w = Math.max(20, resizing.startW + dx);
            const newH = Math.max(20, resizing.startH - dy);
            el.y = resizing.startY + (resizing.startH - newH);
            el.h = newH;
          } else if (resizing.dir === 'sw') {
            const newW = Math.max(20, resizing.startW - dx);
            el.x = resizing.startX + (resizing.startW - newW);
            el.w = newW;
            el.h = Math.max(20, resizing.startH + dy);
          }
        }, false);
      }
    }
    function handleMouseUp() {
      if (dragging || resizing) {
        saveHistory(presentation);
      }
      setDragging(null);
      setResizing(null);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, presentation, currentSlide]);

  function onAddSlide(template) {
    updatePresentation(p => {
      p.slides.splice(currentSlide+1, 0, makeSlide(template, p.theme));
      setCurrentSlide(currentSlide+1);
      setSelectedElementId(null);
    });
  }

  function onDuplicateSlide(index) {
    updatePresentation(p => {
      const copy = JSON.parse(JSON.stringify(p.slides[index]));
      copy.id = uid('slide');
      copy.elements.forEach(el => el.id = uid('el'));
      p.slides.splice(index+1, 0, copy);
    });
  }

  function onDeleteSlide(index) {
    if (presentation.slides.length === 1) return alert('Cannot delete the last slide');
    updatePresentation(p => {
      p.slides.splice(index, 1);
      if (currentSlide >= p.slides.length) setCurrentSlide(p.slides.length - 1);
    });
  }

  function onMoveSlide(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= presentation.slides.length) return;
    updatePresentation(p => {
      const temp = p.slides[index];
      p.slides[index] = p.slides[newIndex];
      p.slides[newIndex] = temp;
      setCurrentSlide(newIndex);
    });
  }

  function onReorderSlides(sourceIndex, destinationIndex) {
    if (sourceIndex === destinationIndex || sourceIndex == null || destinationIndex == null) return;
    updatePresentation(p => {
      const slides = p.slides;
      const [moved] = slides.splice(sourceIndex, 1);
      slides.splice(destinationIndex, 0, moved);
      setCurrentSlide(destinationIndex);
    });
  }

  function onAddText() {
    updatePresentation(p => {
      const themeConfig = THEMES[p.theme] || THEMES.default;
      const el = { id: uid('el'), type: 'text', x: 100, y: 150, w: 500, h: 100, rotation: 0, styles: { fontSize: 24, color: themeConfig.textColor, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left', fontFamily: 'Arial', lineHeight: 1.4, listStyle: 'none' }, content: 'Click to edit text' };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onAddImage(dataUrl) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'image', x: 100, y: 150, w: 400, h: 300, rotation: 0, src: dataUrl };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onAddChart(chartType) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'chart', x: 100, y: 150, w: 400, h: 300, rotation: 0, chartType, data: { labels: ['A','B','C'], datasets: [{ label: 'Series', values: [3,5,2], color: '#4e79a7' }] } };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onAddShape(shapeType) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'shape', x: 300, y: 200, w: 250, h: shapeType==='line'?4:200, rotation: 0, shapeType, fill: '#4e79a7', stroke: '#000000', strokeWidth: 2 };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onDeleteElement() {
    updatePresentation(p => {
      const els = p.slides[currentSlide].elements;
      const idx = els.findIndex(e=>e.id===selectedElementId);
      if (idx>=0) els.splice(idx,1);
      setSelectedElementId(null);
    });
  }

  function onChangeProp(prop, value) {
    if (!selectedElementId) return;
    updatePresentation(p => {
      const el = p.slides[currentSlide].elements.find(e=>e.id===selectedElementId);
      if (!el) return;
      if (el.type === 'text') {
        if (!el.styles) el.styles = {};
        el.styles[prop] = value;
      } else {
        el[prop] = value;
      }
    });
  }

  function onApplyListStyle(styleType) {
    if (!selectedElementId) return;
    updatePresentation(p => {
      const el = p.slides[currentSlide].elements.find(e => e.id === selectedElementId);
      if (!el || el.type !== 'text') return;

      if (!el.styles) el.styles = {};
      const currentStyle = el.styles.listStyle || 'none';
      const nextStyle = currentStyle === styleType ? 'none' : styleType;

      const stripMarkers = (line) => line.replace(/^\s*•\s*/, '').replace(/^\s*\d+[).\-]\s*/, '');
      const lines = (el.content || '').split('\n');

      if (nextStyle === 'bullet') {
        el.content = lines.map(line => {
          const trimmed = stripMarkers(line).trim();
          if (!trimmed) return '';
          return `• ${trimmed}`;
        }).join('\n');
      } else if (nextStyle === 'number') {
        let counter = 1;
        el.content = lines.map(line => {
          const trimmed = stripMarkers(line).trim();
          if (!trimmed) return '';
          return `${counter++}. ${trimmed}`;
        }).join('\n');
      } else {
        el.content = lines.map(line => stripMarkers(line)).join('\n');
      }

      el.styles.listStyle = nextStyle;
    });
  }

  function onChangeText(elId, value) {
    updatePresentation(p => {
      const el = p.slides[currentSlide].elements.find(e=>e.id===elId);
      if (el && el.type === 'text') el.content = value;
    }, false);
  }

  function onChangeBackground(color) {
    updatePresentation(p => {
      p.slides[currentSlide].background = color;
    });
  }

  function onDragStart(elId) {
    const el = selectedSlide.elements.find(e=>e.id===elId);
    if (!el) return;
    setDragging({ id: elId, startX: el.x, startY: el.y, mouseX: event.clientX, mouseY: event.clientY });
  }

  function onResizeStart(elId, dir) {
    const el = selectedSlide.elements.find(e=>e.id===elId);
    if (!el) return;
    setResizing({ id: elId, dir, startX: el.x, startY: el.y, startW: el.w, startH: el.h, mouseX: event.clientX, mouseY: event.clientY });
  }

  function onSave() {
    try {
      // Check if PptxGenJS is available
      if (typeof PptxGenJS === 'undefined') {
        // Fallback to JSON export if PptxGenJS is not available
        console.warn('PptxGenJS not available, falling back to JSON export');
        const presentationData = {
          ...presentation,
          name: presentation.name || 'Untitled Presentation',
          createdAt: new Date().toISOString(),
          version: '1.0'
        };
        
        const dataStr = JSON.stringify(presentationData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${presentationData.name}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        alert(`PowerPoint library not available. Presentation "${presentationData.name}" saved as JSON file instead. Please refresh the page and try again for PowerPoint export.`);
        return;
      }
      
      // Create actual PowerPoint file using PptxGenJS
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'PPT Maker';
      pptx.title = presentation.name || 'Presentation';
      
      presentation.slides.forEach(sl => {
        const slide = pptx.addSlide();
        slide.background = { color: (sl.background || '#ffffff').replace('#','') };
        
        sl.elements.forEach(el => {
          try {
            if (el.type === 'text') {
              const textOptions = {
                x: el.x/96,
                y: el.y/96,
                w: el.w/96,
                h: el.h/96,
                fontSize: el.styles?.fontSize || 18,
                color: (el.styles?.color||'#111111').replace('#',''),
                bold: el.styles?.fontWeight==='bold',
                italic: el.styles?.fontStyle==='italic',
                underline: el.styles?.textDecoration==='underline' ? { style: 'sng' } : false,
                align: el.styles?.textAlign || 'left',
                fontFace: el.styles?.fontFamily || 'Arial',
                valign: 'top'
              };
              slide.addText(el.content || '', textOptions);
            } else if (el.type === 'image') {
              slide.addImage({ 
                data: el.src, 
                x: el.x/96, 
                y: el.y/96, 
                w: el.w/96, 
                h: el.h/96 
              });
            } else if (el.type === 'chart') {
              const labels = el.data?.labels || [];
              const datasets = el.data?.datasets || [];
              if (el.chartType === 'pie' && datasets.length > 0) {
                const data = datasets[0].values.map((v,i)=>({ 
                  name: labels[i]||'Item '+(i+1), 
                  labels:[labels[i]||'Item '+(i+1)], 
                  values:[v] 
                }));
                slide.addChart(pptx.charts.PIE, data, { 
                  x: el.x/96, 
                  y: el.y/96, 
                  w: el.w/96, 
                  h: el.h/96, 
                  showTitle: false 
                });
              } else if (datasets.length > 0) {
                const chartData = datasets.map(ds => ({ 
                  name: ds.label, 
                  labels, 
                  values: ds.values 
                }));
                const chartType = el.chartType === 'line' ? pptx.charts.LINE : pptx.charts.BAR;
                slide.addChart(chartType, chartData, { 
                  x: el.x/96, 
                  y: el.y/96, 
                  w: el.w/96, 
                  h: el.h/96, 
                  barDir: 'col',
                  showTitle: false,
                  chartColors: datasets.map(ds=>(ds.color||'#4e79a7').replace('#',''))
                });
              }
            } else if (el.type === 'shape') {
              const opts = { 
                x: el.x/96, 
                y: el.y/96, 
                w: el.w/96, 
                h: el.h/96, 
                fill: { color: (el.fill||'#4e79a7').replace('#','') }, 
                line: { color: (el.stroke||'#000').replace('#',''), width: (el.strokeWidth||2)/12 } 
              };
              if (el.shapeType === 'rect') {
                slide.addShape(pptx.shapes.RECTANGLE, opts);
              } else if (el.shapeType === 'circle') {
                slide.addShape(pptx.shapes.OVAL, opts);
              } else if (el.shapeType === 'line') {
                slide.addShape(pptx.shapes.LINE, { 
                  x: el.x/96, 
                  y: el.y/96, 
                  w: el.w/96, 
                  h: 0,
                  line: { color: (el.stroke||'#000').replace('#',''), width: (el.strokeWidth||2)/12 } 
                });
              }
            }
          } catch (err) {
            console.error('Error adding element to slide:', err);
          }
        });
      });
      
      // Download the PowerPoint file
      pptx.writeFile({ fileName: (presentation.name || 'Presentation') + '.pptx' });
      alert(`Presentation "${presentation.name || 'Presentation'}" saved and downloaded as PowerPoint file successfully!`);
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed: ' + err.message);
    }
  }

  function onLoad() { setShowLoad(true); }

  function onLoadId(id) {
    try {
      // Try to load from localStorage first
      const storedData = localStorage.getItem(`presentation_${id}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setPresentation(data);
        setCurrentSlide(0);
        setSelectedElementId(null);
        setHistory([JSON.stringify(data)]);
        setHistoryIndex(0);
        setShowLoad(false);
        return;
      }
      
      // Fallback to API if available
      fetch('/api/presentations/'+encodeURIComponent(id))
        .then(r=>r.json())
        .then(data=>{
          setPresentation(data);
          setCurrentSlide(0);
          setSelectedElementId(null);
          setHistory([JSON.stringify(data)]);
          setHistoryIndex(0);
          setShowLoad(false);
        })
        .catch(()=> {
          alert('Load failed: Presentation not found');
        });
    } catch (err) {
      console.error('Load error:', err);
      alert('Load failed: ' + err.message);
    }
  }

  async function onShare() {
    try {
      let presentationId = presentation.id;
      if (!presentationId) {
        presentationId = 'ppt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      const presentationData = normalizePresentation(
        {
          ...presentation,
          id: presentationId,
          name: presentation.name || 'Untitled Presentation',
          createdAt: presentation.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0'
        },
        { fallbackId: presentationId }
      );

      const sanitizedData = JSON.parse(JSON.stringify(presentationData));

      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        throw new Error('Failed to save presentation for sharing');
      }

      const result = await response.json();
      if (result && result.id) {
        presentationId = result.id;
      }

      const payloadToStore = { ...sanitizedData, id: presentationId };
      try {
        localStorage.setItem(`presentation_${presentationId}`, JSON.stringify(payloadToStore));
      } catch (err) {
        console.warn('Unable to cache shared presentation after saving:', err);
      }
      setPresentation(prev => ({ ...prev, id: presentationId }));
      setShowShareDialog(true);
    } catch (err) {
      console.error('Share error:', err);
      alert('Share failed: ' + err.message);
    }
  }

  function onPresent() {
    setPresentMode(true);
    setSelectedElementId(null);
  }

  function onExport() {
    try {
      if (typeof PptxGenJS === 'undefined') {
        alert('Export Failed: PptxGenJS library is not loaded. Please check your internet connection and try again.');
        return;
      }
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'PPT Maker';
      pptx.title = presentation.name || 'Presentation';
      
      presentation.slides.forEach(sl => {
        const slide = pptx.addSlide();
        slide.background = { color: (sl.background || '#ffffff').replace('#','') };
        sl.elements.forEach(el => {
          try {
            if (el.type === 'text') {
              const textOptions = {
                x: el.x/96,
                y: el.y/96,
                w: el.w/96,
                h: el.h/96,
                fontSize: el.styles?.fontSize || 18,
                color: (el.styles?.color||'#111111').replace('#',''),
                bold: el.styles?.fontWeight==='bold',
                italic: el.styles?.fontStyle==='italic',
                underline: el.styles?.textDecoration==='underline' ? { style: 'sng' } : false,
                align: el.styles?.textAlign || 'left',
                fontFace: el.styles?.fontFamily || 'Arial',
                valign: 'top'
              };
              slide.addText(el.content || '', textOptions);
            } else if (el.type === 'image') {
              slide.addImage({ data: el.src, x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96 });
            } else if (el.type === 'chart') {
              const labels = el.data?.labels || [];
              const datasets = el.data?.datasets || [];
              if (el.chartType === 'pie' && datasets.length > 0) {
                const data = datasets[0].values.map((v,i)=>({ name: labels[i]||'Item '+(i+1), labels:[labels[i]||'Item '+(i+1)], values:[v] }));
                slide.addChart(pptx.charts.PIE, data, { x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96, showTitle: false });
              } else if (datasets.length > 0) {
                const chartData = datasets.map(ds => ({ name: ds.label, labels, values: ds.values }));
                const chartType = el.chartType === 'line' ? pptx.charts.LINE : pptx.charts.BAR;
                slide.addChart(chartType, chartData, { 
                  x: el.x/96, 
                  y: el.y/96, 
                  w: el.w/96, 
                  h: el.h/96, 
                  barDir: 'col',
                  showTitle: false,
                  chartColors: datasets.map(ds=>(ds.color||'#4e79a7').replace('#',''))
                });
              }
            } else if (el.type === 'shape') {
              const opts = { 
                x: el.x/96, 
                y: el.y/96, 
                w: el.w/96, 
                h: el.h/96, 
                fill: { color: (el.fill||'#4e79a7').replace('#','') }, 
                line: { color: (el.stroke||'#000').replace('#',''), width: (el.strokeWidth||2)/12 } 
              };
              if (el.shapeType === 'rect') slide.addShape(pptx.shapes.RECTANGLE, opts);
              else if (el.shapeType === 'circle') slide.addShape(pptx.shapes.OVAL, opts);
              else if (el.shapeType === 'line') {
                slide.addShape(pptx.shapes.LINE, { 
                  x: el.x/96, 
                  y: el.y/96, 
                  w: el.w/96, 
                  h: 0,
                  line: { color: (el.stroke||'#000').replace('#',''), width: (el.strokeWidth||2)/12 } 
                });
              }
            }
          } catch (err) {
            console.error('Error adding element to slide:', err);
          }
        });
      });
      pptx.writeFile({ fileName: (presentation.name || 'Presentation') + '.pptx' });
      alert('Presentation exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    }
  }

  function onApplyTheme(themeId) {
    if (!THEMES[themeId]) return;
    updatePresentation(p => {
      const prevThemeConfig = THEMES[p.theme] || THEMES.default;
      const nextThemeConfig = THEMES[themeId];
      p.theme = themeId;
      p.slides.forEach(slide => {
        if (prevThemeConfig && slide.background === prevThemeConfig.slideBackground) {
          slide.background = nextThemeConfig.slideBackground;
        }
        slide.elements.forEach(el => {
          if (el.type === 'text' && el.styles && el.styles.color === prevThemeConfig.textColor) {
            el.styles.color = nextThemeConfig.textColor;
          }
        });
      });
    });
  }

  if (presentMode) {
    return <PresentationMode presentation={presentation} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} onExit={()=>setPresentMode(false)} />;
  }

  return (
    <div className="app">
      <Toolbar
        onAddSlide={onAddSlide}
        onAddText={onAddText}
        onAddImage={onAddImage}
        onAddChart={onAddChart}
        onAddShape={onAddShape}
        onDeleteElement={onDeleteElement}
        onChangeProp={onChangeProp}
        selectedElement={selectedElement}
        onSave={onSave}
        onLoad={() => setShowLoad(true)}
        onExport={onExport}
        onShare={onShare}
        onPresent={() => setPresentMode(true)}
        presentationName={presentation.name}
        setPresentationName={(name) => setPresentation(prev => ({ ...prev, name }))}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onChangeBackground={onChangeBackground}
        currentSlide={selectedSlide}
        onEditChart={() => setShowChartEditor(true)}
        onApplyTheme={onApplyTheme}
        currentTheme={presentation.theme}
        onApplyListStyle={onApplyListStyle}
      />

      <div className="main">
        <div className="sidebar">
          <div className="sidebar-header">
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                marginBottom: '12px',
              }}
            >
              SLIDES ({presentation.slides.length})
            </div>
          </div>
          <div className="sidebar-slides">
            {presentation.slides.map((s, i) => (
              <SlideThumb
                key={s.id}
                slide={s}
                index={i}
                total={presentation.slides.length}
                active={i === currentSlide}
                onClick={() => {
                  setCurrentSlide(i);
                  setSelectedElementId(null);
                }}
                onDuplicate={() => onDuplicateSlide(i)}
                onDelete={() => onDeleteSlide(i)}
                onMoveUp={() => onMoveSlide(i, 'up')}
                onMoveDown={() => onMoveSlide(i, 'down')}
                onDragStart={(index) => {
                  setDraggingSlideIndex(index);
                  setDragOverSlideIndex(index);
                }}
                onDragOver={(index) => {
                  if (draggingSlideIndex === null) return;
                  setDragOverSlideIndex(index);
                }}
                onDrop={(index) => {
                  if (draggingSlideIndex === null) return;
                  onReorderSlides(draggingSlideIndex, index);
                  setDraggingSlideIndex(null);
                  setDragOverSlideIndex(null);
                }}
                onDragLeave={() => {
                  setDragOverSlideIndex(prev => (prev === i ? null : prev));
                }}
                onDragEnd={() => {
                  setDraggingSlideIndex(null);
                  setDragOverSlideIndex(null);
                }}
                isDragging={draggingSlideIndex === i}
                isDragOver={dragOverSlideIndex === i && draggingSlideIndex !== i}
              />
            ))}
          </div>
        </div>

        <div className="stage">
          {selectedSlide && (
            <Canvas
              slide={selectedSlide}
              selectedElementId={selectedElementId}
              onSelect={setSelectedElementId}
              onChangeText={onChangeText}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
            />
          )}
        </div>
      </div>

      {showLoad && <LoadDialog onClose={()=>setShowLoad(false)} onLoadId={onLoadId} />}
      {showChartEditor && selectedElement && selectedElement.type==='chart' && (
        <ChartEditor element={selectedElement} onUpdate={(patch)=>{
          updatePresentation(p => {
            const el = p.slides[currentSlide].elements.find(e=>e.id===selectedElementId);
            if (el) Object.assign(el, patch);
          });
          setShowChartEditor(false);
        }} onClose={()=> setShowChartEditor(false)} />
      )}
      {showShareDialog && <ShareDialog presentationId={presentation.id} onClose={()=>setShowShareDialog(false)} />}
    </div>
  );
}

function ShareDialog({ presentationId, onClose }) {
  const shareUrl = `${window.location.origin}?presentation=${presentationId}`;
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="modal">
      <div className="modal-body">
        <h3>Share Presentation</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Share this link to let anyone view your presentation. Updates you save will appear when they refresh.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--color-panel)',
              color: 'var(--color-text-primary)',
            }}
            onClick={(e) => e.target.select()}
          />
          <button onClick={copyToClipboard} style={{ padding: '10px 20px' }}>
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
        <div className="actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}function PresentationMode({ presentation, currentSlide, setCurrentSlide, onExit }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentSlide < presentation.slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(presentation.slides.length - 1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, presentation.slides.length, onExit, setCurrentSlide]);

  const slide = presentation.slides[currentSlide];
  if (!slide) return null;

  return (
    <div className="presentation-mode">
      <div className="presentation-slide" style={{ background: slide.background, aspectRatio: '4/3', maxWidth: '100vw', maxHeight: '100vh' }}>
        {slide.elements.map(el => {
          const style = { left: el.x, top: el.y, width: el.w, height: el.h, transform: `rotate(${el.rotation||0}deg)` };
          if (el.type === 'text') {
            return (
              <div
                key={el.id}
                className="present-text-el"
                style={{
                  ...style,
                  fontSize: el.styles?.fontSize,
                  color: el.styles?.color,
                  fontWeight: el.styles?.fontWeight,
                  fontStyle: el.styles?.fontStyle,
                  textDecoration: el.styles?.textDecoration,
                  textAlign: el.styles?.textAlign,
                  fontFamily: el.styles?.fontFamily || 'Arial',
                  whiteSpace: 'pre-wrap',
                  padding: '4px',
                }}
              >
                {el.content}
              </div>
            );
          }
          if (el.type === 'image') {
            return (
              <div key={el.id} style={style}>
                <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            );
          }
          if (el.type === 'chart') {
            return (
              <div key={el.id} style={style}>
                <ChartElement element={el} />
              </div>
            );
          }
          if (el.type === 'shape') {
            return (
              <div key={el.id} style={style}>
                <ShapeElement element={el} />
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="presentation-controls">
        <button onClick={onExit} title="Exit (Esc)">Exit</button>
        <span className="slide-counter">{currentSlide + 1} / {presentation.slides.length}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
            title="Previous slide"
          >
            Previous
          </button>
          <button
            onClick={() => currentSlide < presentation.slides.length - 1 && setCurrentSlide(currentSlide + 1)}
            disabled={currentSlide === presentation.slides.length - 1}
            title="Next slide"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);









