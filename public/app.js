const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;

// Import SlideLayouts component
const SlideLayouts = window.SlideLayouts || (() => null);

function isValidHexColor(value) {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function coerceColorValue(value, fallback) {
  return isValidHexColor(value) ? value.trim() : fallback;
}

function ColorIconPicker({ title, ariaLabel, icon, value, fallback = '#ffffff', onChange, onReset }) {
  const resolved = isValidHexColor(value) ? value.trim() : null;
  const inputValue = coerceColorValue(value, fallback);

  return (
    <label
      className={`icon-color-picker${resolved ? ' icon-color-picker--active' : ''}`}
      title={title}
      aria-label={ariaLabel || title}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (onReset) onReset();
      }}
    >
      <span className="icon-color-picker__icon" aria-hidden="true">
        {icon}
      </span>
      <span
        className="icon-color-picker__swatch"
        style={{
          background: resolved || 'transparent',
          borderColor: resolved || 'rgba(148, 163, 184, 0.6)',
        }}
        aria-hidden="true"
      />
      <input
        type="color"
        className="icon-color-picker__input"
        value={inputValue}
        onChange={(event) => {
          const next = event.target.value;
          if (onChange) onChange(coerceColorValue(next, fallback));
        }}
      />
    </label>
  );
}

// Debug function to check library availability
function resolvePptxGen() {
  if (typeof window === 'undefined') return null;
  const candidates = [
    typeof PptxGenJS !== 'undefined' ? PptxGenJS : null,
    window.PptxGenJS,
    window.pptxgen,
    window.pptxgenjs,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (typeof candidate === 'function') return candidate;
    if (candidate && typeof candidate.default === 'function') return candidate.default;
    if (candidate && typeof candidate.PptxGenJS === 'function') return candidate.PptxGenJS;
  }
  return null;
}

function ensureChartEnum(pptx, PptxConstructor) {
  if (!pptx || typeof pptx !== 'object') return pptx;
  if (!pptx.ChartType) {
    const chartEnum = PptxConstructor?.ChartType || PptxConstructor?.default?.ChartType;
    if (chartEnum) {
      pptx.ChartType = chartEnum;
    }
  }
  return pptx;
}

function checkLibraryStatus() {
  const PptxConstructor = resolvePptxGen();
  console.log('Library Status Check:');
  console.log('- PptxGenJS available:', Boolean(PptxConstructor));
  console.log('- Chart.js available:', typeof Chart !== 'undefined');
  if (PptxConstructor) {
    const version = PptxConstructor.version || PptxConstructor.default?.version || 'unknown';
    console.log('- PptxGenJS version:', version);
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
];

const THEMES = [
  {
    id: 'blank',
    name: 'Blank',
    slideBackground: '#ffffff',
    textColor: '#1f2937',
    primaryColor: '#2563eb',
    heading: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: 44,
      fontWeight: '700',
      color: '#111827',
      lineHeight: 1.16,
    },
    body: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: 24,
      fontWeight: '400',
      color: '#1f2937',
      lineHeight: 1.45,
    },
    placeholders: {
      title: { fontFamily: 'Calibri, Arial, sans-serif', color: 'rgba(15,23,42,0.38)', fontWeight: '600' },
      body: { fontFamily: 'Calibri, Arial, sans-serif', color: 'rgba(71,85,105,0.5)', fontStyle: 'italic' },
    },
    accentColors: ['#2563eb', '#9333ea', '#f59e0b', '#10b981', '#ef4444', '#38bdf8'],
    shapeStyles: {
      fill: '#2563eb',
      stroke: 'rgba(37,99,235,0.25)',
      strokeWidth: 2,
      shadow: '0 10px 30px rgba(37,99,235,0.18)',
    },
    chartPalette: ['#2563eb', '#9333ea', '#f59e0b', '#10b981', '#ef4444', '#38bdf8'],
  },
  {
    id: 'slice',
    name: 'Slice',
    slideBackground: 'linear-gradient(135deg, #f97316 0%, #fb923c 45%, #fff7ed 100%)',
    textColor: '#1f2937',
    primaryColor: '#ea580c',
    heading: {
      fontFamily: 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif',
      fontSize: 48,
      fontWeight: '700',
      color: '#9a3412',
      lineHeight: 1.1,
    },
    body: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: 24,
      fontWeight: '400',
      color: '#1f2937',
      lineHeight: 1.5,
    },
    placeholders: {
      title: { fontFamily: 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif', color: 'rgba(79,70,229,0.55)', fontWeight: '700' },
      body: { fontFamily: 'Calibri, Arial, sans-serif', color: 'rgba(148,163,184,0.65)', fontStyle: 'italic' },
    },
    accentColors: ['#ea580c', '#facc15', '#0f766e', '#2563eb', '#f97316', '#fb7185'],
    shapeStyles: {
      fill: '#ea580c',
      stroke: 'rgba(234,88,12,0.25)',
      strokeWidth: 0,
      shadow: '0 12px 30px rgba(234,88,12,0.25)',
    },
    chartPalette: ['#ea580c', '#f59e0b', '#facc15', '#0f766e', '#0369a1', '#db2777'],
  },
  {
    id: 'wisp',
    name: 'Wisp',
    slideBackground: 'linear-gradient(180deg, #f5f3ff 0%, #e0f2fe 100%)',
    textColor: '#1e293b',
    primaryColor: '#6366f1',
    heading: {
      fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
      fontSize: 46,
      fontWeight: '700',
      color: '#312e81',
      lineHeight: 1.18,
    },
    body: {
      fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
      fontSize: 23,
      fontWeight: '400',
      color: '#1e293b',
      lineHeight: 1.55,
    },
    placeholders: {
      title: { fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', color: 'rgba(51,65,85,0.5)', fontWeight: '600' },
      body: { fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', color: 'rgba(100,116,139,0.55)', fontStyle: 'italic' },
    },
    accentColors: ['#6366f1', '#4338ca', '#38bdf8', '#0ea5e9', '#ec4899', '#f97316'],
    shapeStyles: {
      fill: 'rgba(99,102,241,0.9)',
      stroke: 'rgba(99,102,241,0.3)',
      strokeWidth: 2,
      shadow: '0 12px 32px rgba(99,102,241,0.3)',
    },
    chartPalette: ['#6366f1', '#38bdf8', '#0ea5e9', '#9333ea', '#ec4899', '#f472b6'],
  },
  {
    id: 'organic',
    name: 'Organic',
    slideBackground: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
    textColor: '#064e3b',
    primaryColor: '#047857',
    heading: {
      fontFamily: 'Source Serif Pro, Georgia, serif',
      fontSize: 48,
      fontWeight: '700',
      color: '#065f46',
      lineHeight: 1.14,
    },
    body: {
      fontFamily: 'Source Sans Pro, Arial, sans-serif',
      fontSize: 24,
      fontWeight: '400',
      color: '#065f46',
      lineHeight: 1.58,
    },
    placeholders: {
      title: { fontFamily: 'Source Serif Pro, Georgia, serif', color: 'rgba(4,120,87,0.5)', fontWeight: '600' },
      body: { fontFamily: 'Source Sans Pro, Arial, sans-serif', color: 'rgba(15,118,110,0.5)', fontStyle: 'italic' },
    },
    accentColors: ['#047857', '#0f766e', '#10b981', '#f59e0b', '#f97316', '#ec4899'],
    shapeStyles: {
      fill: '#10b981',
      stroke: 'rgba(16,185,129,0.25)',
      strokeWidth: 0,
      shadow: '0 14px 34px rgba(16,185,129,0.3)',
    },
    chartPalette: ['#047857', '#10b981', '#34d399', '#f97316', '#f59e0b', '#ec4899'],
  },
  {
    id: 'ion-boardroom',
    name: 'Ion Boardroom',
    slideBackground: 'linear-gradient(180deg, #0f172a 0%, #1e293b 55%, #111827 100%)',
    textColor: '#e2e8f0',
    primaryColor: '#38bdf8',
    heading: {
      fontFamily: 'Roboto Condensed, Arial Narrow, Arial, sans-serif',
      fontSize: 46,
      fontWeight: '700',
      color: '#e2e8f0',
      lineHeight: 1.18,
      letterSpacing: 0.02,
    },
    body: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 23,
      fontWeight: '400',
      color: '#cbd5f5',
      lineHeight: 1.6,
    },
    placeholders: {
      title: { fontFamily: 'Roboto Condensed, Arial Narrow, Arial, sans-serif', color: 'rgba(226,232,240,0.45)', fontWeight: '600' },
      body: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif', color: 'rgba(148,163,184,0.5)', fontStyle: 'italic' },
    },
    accentColors: ['#38bdf8', '#0ea5e9', '#22d3ee', '#f97316', '#facc15', '#a855f7'],
    shapeStyles: {
      fill: '#38bdf8',
      stroke: 'rgba(14,165,233,0.4)',
      strokeWidth: 0,
      shadow: '0 18px 44px rgba(14,165,233,0.45)',
    },
    chartPalette: ['#38bdf8', '#0ea5e9', '#22d3ee', '#f97316', '#facc15', '#a855f7'],
  },
]
;

const THEMES_BY_ID = THEMES.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

const DEFAULT_THEME = THEMES[0];

function resolveTheme(themeId) {
  return THEMES_BY_ID[themeId] || DEFAULT_THEME;
}

function applyThemeToTextElement(element, themeConfig) {
  const variant = element.textVariant === 'heading' ? 'heading' : 'body';
  const variantStyles = themeConfig?.[variant] || themeConfig?.body || DEFAULT_THEME.body;
  const placeholderStyles = themeConfig?.placeholders || {};
  const nextStyles = { ...(element.styles || {}) };

  if (variantStyles?.fontFamily) nextStyles.fontFamily = variantStyles.fontFamily;
  if (variantStyles?.color) nextStyles.color = variantStyles.color;
  if (Number.isFinite(variantStyles?.lineHeight)) nextStyles.lineHeight = variantStyles.lineHeight;
  if (Number.isFinite(variantStyles?.fontSize)) {
    nextStyles.fontSize = variantStyles.fontSize;
  }

  const nextElement = {
    ...element,
    styles: nextStyles,
  };

  if (element.placeholder) {
    const key = getPlaceholderKey(element.placeholder);
    const placeholderStyle = key && placeholderStyles[key] ? placeholderStyles[key] : null;
    if (placeholderStyle) {
      nextElement.placeholderStyle = placeholderStyle;
    }
  }

  return nextElement;
}

function applyThemeToShapeElement(element, themeConfig) {
  const shapeDefaults = themeConfig?.shapeStyles || {};
  const isLine = element.shapeType === 'line';
  const nextShape = {
    ...element,
  };

  if (!isLine) {
    if (shapeDefaults.fill) {
      nextShape.fill = shapeDefaults.fill;
    }
    if (shapeDefaults.shadow !== undefined) {
      nextShape.shadow = shapeDefaults.shadow;
    }
  }

  if (shapeDefaults.stroke) {
    nextShape.stroke = shapeDefaults.stroke;
  }
  if (Number.isFinite(shapeDefaults.strokeWidth)) {
    nextShape.strokeWidth = shapeDefaults.strokeWidth;
  }

  return nextShape;
}

function applyThemeToChartElement(element, themeConfig) {
  const palette = (themeConfig?.chartPalette && themeConfig.chartPalette.length)
    ? themeConfig.chartPalette
    : DEFAULT_THEME.chartPalette;

  const nextDatasets = (element.data?.datasets || []).map((dataset, datasetIndex) => {
    const nextDataset = { ...dataset };
    if (Array.isArray(dataset.segmentColors) && dataset.segmentColors.length) {
      nextDataset.segmentColors = dataset.segmentColors.map((_, colorIndex) => palette[colorIndex % palette.length]);
    } else {
      nextDataset.color = palette[datasetIndex % palette.length];
    }
    return nextDataset;
  });

  return {
    ...element,
    data: {
      ...(element.data || {}),
      datasets: nextDatasets,
    },
  };
}

function applyThemeToSlide(slide, themeConfig) {
  if (!slide) return slide;
  const nextTheme = themeConfig || DEFAULT_THEME;

  const nextElements = Array.isArray(slide.elements)
    ? slide.elements.map((element) => {
        if (!element || typeof element !== 'object') return element;
        if (element.type === 'text') return applyThemeToTextElement(element, nextTheme);
        if (element.type === 'shape') return applyThemeToShapeElement(element, nextTheme);
        if (element.type === 'chart') return applyThemeToChartElement(element, nextTheme);
        return { ...element };
      })
    : [];

  return {
    ...slide,
    background: nextTheme.slideBackground,
    elements: nextElements,
  };
}

function applyThemeToPresentation(presentation, themeId) {
  if (!presentation || typeof presentation !== 'object') return presentation;
  const nextThemeId = THEMES_BY_ID[themeId] ? themeId : DEFAULT_THEME.id;
  const themeConfig = resolveTheme(nextThemeId);
  const slides = Array.isArray(presentation.slides)
    ? presentation.slides.map((slide) => applyThemeToSlide(slide, themeConfig))
    : [];

  return {
    ...presentation,
    selectedThemeId: nextThemeId,
    slides,
  };
}

const DEFAULT_TEXT_PLACEHOLDERS = {
  title: 'Click to add title',
  subtitle: 'Click to add subtitle',
  body: 'Click to add text',
  content: 'Click to add content',
  bullet: '• Click to add content\n• Add your key points here\n• Use bullet points for clarity',
};

const DEFAULT_PLACEHOLDER_VALUES = new Set(Object.values(DEFAULT_TEXT_PLACEHOLDERS));
const LEGACY_PLACEHOLDER_VALUES = new Set([
  ...DEFAULT_PLACEHOLDER_VALUES,
  'Click to edit text',
]);

function getPlaceholderKey(value) {
  if (!value) return null;
  for (const [key, placeholderValue] of Object.entries(DEFAULT_TEXT_PLACEHOLDERS)) {
    if (placeholderValue === value) return key;
  }
  return null;
}

// Searchable Font Dropdown Component
function FontDropdown({ value, onChange, title, trigger = 'inline' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef();

  const normalizedSearch = search.trim().toLowerCase();
  const filteredFonts = useMemo(() => {
    if (!normalizedSearch) return FONT_FAMILIES;

    const collapsedSearch = normalizedSearch.replace(/\s+/g, '');

    const scoredFonts = FONT_FAMILIES.map((font) => {
      const lower = font.toLowerCase();
      const collapsed = lower.replace(/\s+/g, '');

      let score = 0;
      if (lower.startsWith(normalizedSearch)) {
        score = 3;
      } else if (lower.includes(normalizedSearch)) {
        score = 2;
      } else if (collapsed.includes(collapsedSearch)) {
        score = 1;
      } else {
        score = 0;
      }

      return { font, score };
    }).filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.font.localeCompare(b.font));

    return scoredFonts.map(({ font }) => font);
  }, [normalizedSearch]);

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

  const isIconTrigger = trigger === 'icon';

  return (
    <div
      className={`font-dropdown${isIconTrigger ? ' font-dropdown--icon' : ''}`}
      ref={dropdownRef}
      style={{ position: 'relative', width: isIconTrigger ? 'auto' : '140px' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        className={`font-dropdown__trigger${isIconTrigger ? ' font-dropdown__trigger--icon' : ''}`}
        aria-label={`${title}${value ? `: ${value}` : ''}`}
      >
        {isIconTrigger ? (
          <span className="font-dropdown__preview" style={{ fontFamily: value || 'Arial' }} aria-hidden="true">
            Aa
          </span>
        ) : (
          <span className="font-dropdown__label" title={value || 'Arial'}>
            {value || 'Arial'}
          </span>
        )}
        <span className="font-dropdown__caret" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="font-dropdown__menu" style={{ maxHeight: '240px' }}>
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
          <div className="font-dropdown__list" style={{ maxHeight: '176px', overflowY: 'auto' }}>
            {filteredFonts.map(font => (
              <div
                key={font}
                onClick={() => handleSelect(font)}
                style={{
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: font,
                  borderBottom: '1px solid rgba(203,213,225,0.45)',
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
    name: '',
    selectedThemeId: DEFAULT_THEME.id,
    slides: [ makeSlide('title', DEFAULT_THEME.id) ],
  };
}

function resolvePlaceholderStyle(themeConfig, placeholder, variant = 'body') {
  if (!themeConfig) return null;
  const placeholders = themeConfig.placeholders || {};
  const placeholderKey = placeholder ? getPlaceholderKey(placeholder) : null;
  if (placeholderKey && placeholders[placeholderKey]) {
    return placeholders[placeholderKey];
  }
  const fallbackKey = variant === 'heading' ? 'title' : 'body';
  return placeholders[fallbackKey] || null;
}

function createThemedTextElement({
  themeConfig = DEFAULT_THEME,
  variant = 'body',
  placeholder,
  x = 100,
  y = 120,
  w = 400,
  h = 120,
  textAlign = 'left',
  listStyle = 'none',
}) {
  const normalizedVariant = variant === 'heading' ? 'heading' : 'body';
  const variantStyles = themeConfig?.[normalizedVariant] || {};
  const resolvedPlaceholder = placeholder || (normalizedVariant === 'heading'
    ? DEFAULT_TEXT_PLACEHOLDERS.title
    : DEFAULT_TEXT_PLACEHOLDERS.body);
  const placeholderStyle = resolvePlaceholderStyle(themeConfig, resolvedPlaceholder, normalizedVariant);

  const fontFamily = typeof variantStyles.fontFamily === 'string' && variantStyles.fontFamily.trim()
    ? variantStyles.fontFamily.trim()
    : 'Arial';
  const fontSize = Number.isFinite(variantStyles.fontSize)
    ? variantStyles.fontSize
    : (normalizedVariant === 'heading' ? 36 : 20);
  const fontWeight = variantStyles.fontWeight || (normalizedVariant === 'heading' ? 'bold' : 'normal');
  const fontStyle = variantStyles.fontStyle || 'normal';
  const lineHeight = Number.isFinite(variantStyles.lineHeight)
    ? variantStyles.lineHeight
    : (normalizedVariant === 'heading' ? 1.2 : 1.4);
  const color = variantStyles.color || themeConfig?.textColor || '#111111';
  const letterSpacing = Number.isFinite(variantStyles.letterSpacing)
    ? variantStyles.letterSpacing
    : undefined;

  const element = {
    id: uid('el'),
    type: 'text',
    x,
    y,
    w,
    h,
    rotation: 0,
    styles: {
      fontSize,
      color,
      fontWeight,
      fontStyle,
      textDecoration: 'none',
      textAlign,
      fontFamily,
      lineHeight,
      listStyle,
    },
    placeholder: resolvedPlaceholder,
    placeholderStyle: placeholderStyle || undefined,
    textVariant: normalizedVariant,
    content: '',
  };

  if (letterSpacing !== undefined) {
    element.styles.letterSpacing = letterSpacing;
  }

  return element;
}

function resolveSlideBackgroundFill(slide) {
  if (!slide) return '#ffffff';
  if (typeof slide.background === 'string' && slide.background.trim()) return slide.background;
  return '#ffffff';
}

function normalizeCssAngle(angle) {
  const value = Number(angle);
  if (!Number.isFinite(value)) return 0;
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function cssAngleToCanvasVector(angle) {
  const cssAngle = normalizeCssAngle(angle);
  const theta = ((90 - cssAngle) * Math.PI) / 180;
  const vx = Math.cos(theta);
  const vy = -Math.sin(theta);
  return { vx, vy };
}

function cssAngleToOpenXml(angle) {
  const cssAngle = normalizeCssAngle(angle);
  const converted = ((450 - cssAngle) % 360 + 360) % 360;
  return Math.round(converted * 60000);
}

function splitGradientArgs(input) {
  if (typeof input !== 'string') return [];
  const parts = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    }
    if (char === ',' && depth === 0) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function parseLinearGradient(gradient) {
  if (typeof gradient !== 'string') return null;
  const match = gradient.match(/linear-gradient\((.+)\)/i);
  if (!match) return null;
  const parts = splitGradientArgs(match[1]);
  if (!parts.length) return null;
  let angle = 180;
  const stops = [];
  parts.forEach((part, index) => {
    if (index === 0 && /deg/.test(part)) {
      const angleMatch = part.match(/(-?\d+(?:\.\d+)?)deg/);
      if (angleMatch) {
        angle = parseFloat(angleMatch[1]);
        return;
      }
    }
    const colorMatch = part.match(/(rgba?\([^\)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/);
    if (!colorMatch) return;
    const color = colorMatch[1];
    const posMatch = part.match(/(\d+(?:\.\d+)?)%/);
    const position = posMatch ? Math.min(100, Math.max(0, parseFloat(posMatch[1]))) / 100 : null;
    stops.push({ color, position });
  });
  if (stops.length < 2) return null;
  stops.forEach((stop, idx) => {
    if (stop.position == null) {
      stop.position = stops.length === 1 ? 0 : idx / (stops.length - 1);
    }
  });
  return { angle, stops };
}

function renderGradientToDataUrl(gradient, width = 1920, height = 1080) {
  const parsed = typeof gradient === 'string' ? parseLinearGradient(gradient) : null;
  if (!parsed) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const { vx, vy } = cssAngleToCanvasVector(parsed.angle);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const len = Math.abs(halfWidth * vx) + Math.abs(halfHeight * vy) || Math.max(halfWidth, halfHeight);
  const x0 = halfWidth - vx * len;
  const y0 = halfHeight - vy * len;
  const x1 = halfWidth + vx * len;
  const y1 = halfHeight + vy * len;
  const canvasGradient = ctx.createLinearGradient(x0, y0, x1, y1);
  parsed.stops.forEach((stop) => {
    canvasGradient.addColorStop(stop.position, stop.color);
  });
  ctx.fillStyle = canvasGradient;
  ctx.fillRect(0, 0, width, height);
  try {
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to encode gradient as image', err);
    return null;
  }
}

function resolveSlideBackgroundForExport(background) {
  if (!background) {
    return { type: 'color', value: '#ffffff' };
  }

  if (typeof background === 'string') {
    if (background.includes('gradient')) {
      const gradientImage = renderGradientToDataUrl(background);
      if (gradientImage) {
        return {
          type: 'image',
          value: gradientImage,
          sizing: 'cover',
          original: background,
        };
      }
      const colorMatch = background.match(/#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)/i);
      if (colorMatch && colorMatch[0]) {
        return {
          type: 'color',
          value: colorMatch[0],
          original: background,
        };
      }
      return {
        type: 'color',
        value: '#ffffff',
        original: background,
      };
    }
    return { type: 'color', value: background };
  }

  if (typeof background === 'object') {
    if (background.image) {
      return {
        type: 'image',
        value: background.image,
        sizing: background.sizing || 'cover',
      };
    }
    if (background.gradient) {
      const gradientString = typeof background.gradient === 'string'
        ? background.gradient
        : background.gradient.css || null;
      const gradientImage = renderGradientToDataUrl(gradientString);
      if (gradientImage) {
        return {
          type: 'image',
          value: gradientImage,
          sizing: 'cover',
          original: gradientString || background.gradient,
        };
      }
      const colors = background.gradient.colors || [];
      if (colors.length > 0 && colors[0].color) {
        return {
          type: 'color',
          value: colors[0].color,
          original: background.gradient,
        };
      }
    }
    if (background.color) {
      return {
        type: 'color',
        value: background.color,
      };
    }
  }

  return { type: 'color', value: '#ffffff' };
}

const DEFAULT_OFFICE_ACCENTS = ['4F81BD', 'C0504D', '9BBB59', '8064A2', '4BACC6', 'F79646'];
const PPT_THEME_REL_IDS = {
  master: 'rIdPptThemeMaster1',
  layout: 'rIdPptThemeLayout1',
};

function ensureThemeHex(value, fallback = '#FFFFFF') {
  const normalized = normalizeColor(value || fallback, fallback);
  if (typeof normalized === 'string' && /^[0-9A-F]{6}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  return 'FFFFFF';
}

function adjustHex(hex, ratio = 0) {
  const clampRatio = Math.max(-1, Math.min(1, ratio));
  const channels = [0, 2, 4].map((idx) => parseInt(hex.slice(idx, idx + 2) || '00', 16));
  const adjusted = channels.map((value) => {
    if (clampRatio >= 0) {
      return Math.round(value + (255 - value) * clampRatio);
    }
    return Math.round(value * (1 + clampRatio));
  });
  return adjusted
    .map((val) => val.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function getFirstFontFamily(fontValue, fallback = 'Calibri') {
  if (typeof fontValue === 'string' && fontValue.trim()) {
    return fontValue.split(',')[0].replace(/['"]/g, '').trim() || fallback;
  }
  return fallback;
}

function extractColorsFromBackground(background) {
  if (!background) return [];
  let source = '';
  if (typeof background === 'string') {
    source = background;
  } else if (typeof background === 'object') {
    if (background.color) source = background.color;
    if (background.gradient?.colors?.length) {
      return background.gradient.colors
        .map((entry) => ensureThemeHex(entry.color, '#FFFFFF'))
        .filter(Boolean);
    }
  }

  if (typeof source !== 'string') return [];
  const matches = source.match(/#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)/g);
  if (!matches) return [];
  return matches
    .map((color) => ensureThemeHex(color, '#FFFFFF'))
    .filter(Boolean);
}

function buildThemeColorSet(themeConfig = DEFAULT_THEME) {
  const backgroundColors = extractColorsFromBackground(themeConfig?.slideBackground);
  const baseBackground = backgroundColors[0] || ensureThemeHex('#FFFFFF', '#FFFFFF');
  const textColor = ensureThemeHex(themeConfig?.textColor || '#111111', '#111111');
  const primaryColor = ensureThemeHex(themeConfig?.primaryColor || textColor, '#1F497D');

  const accentColors = Array.isArray(themeConfig?.accentColors)
    ? themeConfig.accentColors.map((color, idx) => ensureThemeHex(color, DEFAULT_OFFICE_ACCENTS[idx] || '#FFFFFF'))
    : [];

  while (accentColors.length < 6) {
    accentColors.push(DEFAULT_OFFICE_ACCENTS[accentColors.length]);
  }

  return {
    name: themeConfig?.name || 'Custom Theme',
    light1: baseBackground,
    light2: adjustHex(baseBackground, 0.15),
    dark1: textColor,
    dark2: adjustHex(primaryColor, -0.2),
    accent1: accentColors[0],
    accent2: accentColors[1],
    accent3: accentColors[2],
    accent4: accentColors[3],
    accent5: accentColors[4],
    accent6: accentColors[5],
    hlink: accentColors[0],
    folHlink: accentColors[1],
  };
}

function buildBackgroundFillXml(themeConfig, colors) {
  const backgroundValue = themeConfig?.slideBackground;
  const parsedGradient = typeof backgroundValue === 'string' && backgroundValue.includes('gradient')
    ? parseLinearGradient(backgroundValue)
    : null;
  if (parsedGradient && parsedGradient.stops?.length >= 2) {
    const stopNodes = parsedGradient.stops
      .map((stop) => {
        const colorHex = ensureThemeHex(stop.color, colors.light1 || 'FFFFFF');
        const position = Math.round((stop.position ?? 0) * 100000);
        return `<a:gs pos="${Math.max(0, Math.min(100000, position))}"><a:srgbClr val="${colorHex}"/></a:gs>`;
      })
      .join('');
    const openXmlAngle = cssAngleToOpenXml(parsedGradient.angle);
    return `<a:gradFill rotWithShape="1"><a:gsLst>${stopNodes}</a:gsLst><a:lin ang="${openXmlAngle}" scaled="1"/></a:gradFill>`;
  }
  const fallbackColor = ensureThemeHex(backgroundValue || colors.light1 || '#FFFFFF', colors.light1 || '#FFFFFF');
  return `<a:solidFill><a:srgbClr val="${fallbackColor}"/></a:solidFill>`;
}

function buildPlaceholderTxBodyXml(colorHex, fontFamily, fontSize = 3200) {
  const safeColor = ensureThemeHex(colorHex, 'FFFFFF');
  const safeFont = fontFamily || 'Calibri';
  return `<p:txBody>
    <a:bodyPr/>
    <a:lstStyle/>
    <a:p>
      <a:pPr>
        <a:defRPr sz="${fontSize}">
          <a:solidFill><a:srgbClr val="${safeColor}"/></a:solidFill>
          <a:latin typeface="${safeFont}"/>
        </a:defRPr>
      </a:pPr>
      <a:endParaRPr lang="en-US"/>
    </a:p>
  </p:txBody>`;
}

function buildDefaultTextStyleXml(themeConfig) {
  const headingFont = getFirstFontFamily(themeConfig?.heading?.fontFamily, 'Calibri');
  const bodyFont = getFirstFontFamily(themeConfig?.body?.fontFamily, 'Calibri');
  const headingColor = ensureThemeHex(themeConfig?.heading?.color || '#111111', '111111');
  const bodyColor = ensureThemeHex(themeConfig?.body?.color || '#333333', '333333');
  return `<p:defaultTextStyle>
    <a:defPPr>
      <a:defRPr lang="en-US" sz="1800">
        <a:solidFill><a:srgbClr val="${bodyColor}"/></a:solidFill>
        <a:latin typeface="${bodyFont}"/>
      </a:defRPr>
    </a:defPPr>
    <a:lvl1PPr marL="0" algn="l">
      <a:defRPr sz="4400" b="1" kern="1200">
        <a:solidFill><a:srgbClr val="${headingColor}"/></a:solidFill>
        <a:latin typeface="${headingFont}"/>
      </a:defRPr>
    </a:lvl1PPr>
    <a:lvl2PPr marL="457200" algn="l">
      <a:defRPr sz="3200">
        <a:solidFill><a:srgbClr val="${bodyColor}"/></a:solidFill>
        <a:latin typeface="${bodyFont}"/>
      </a:defRPr>
    </a:lvl2PPr>
  </p:defaultTextStyle>`;
}

function createThemeXml(themeConfig, colors) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="${colors.name}">
  <a:themeElements>
    <a:clrScheme name="${colors.name}">
      <a:dk1><a:srgbClr val="${colors.dark1}"/></a:dk1>
      <a:lt1><a:srgbClr val="${colors.light1}"/></a:lt1>
      <a:dk2><a:srgbClr val="${colors.dark2}"/></a:dk2>
      <a:lt2><a:srgbClr val="${colors.light2}"/></a:lt2>
      <a:accent1><a:srgbClr val="${colors.accent1}"/></a:accent1>
      <a:accent2><a:srgbClr val="${colors.accent2}"/></a:accent2>
      <a:accent3><a:srgbClr val="${colors.accent3}"/></a:accent3>
      <a:accent4><a:srgbClr val="${colors.accent4}"/></a:accent4>
      <a:accent5><a:srgbClr val="${colors.accent5}"/></a:accent5>
      <a:accent6><a:srgbClr val="${colors.accent6}"/></a:accent6>
      <a:hlink><a:srgbClr val="${colors.hlink}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${colors.folHlink}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="${colors.name}">
      <a:majorFont>
        <a:latin typeface="${getFirstFontFamily(themeConfig?.heading?.fontFamily, 'Calibri')}"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="${getFirstFontFamily(themeConfig?.body?.fontFamily, 'Calibri')}"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="${colors.name}">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0">
              <a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="103000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`;
}

function createSlideMasterXml(themeConfig, colors) {
  const backgroundFill = buildBackgroundFillXml(themeConfig, colors);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr>${backgroundFill}</p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle>
      <a:lvl1PPr algn="l">
        <a:defRPr sz="4400" b="1">
          <a:latin typeface="${getFirstFontFamily(themeConfig?.heading?.fontFamily, 'Calibri')}"/>
        </a:defRPr>
      </a:lvl1PPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1PPr marL="0" algn="l">
        <a:defRPr sz="3200">
          <a:latin typeface="${getFirstFontFamily(themeConfig?.body?.fontFamily, 'Calibri')}"/>
        </a:defRPr>
      </a:lvl1PPr>
    </p:bodyStyle>
  </p:txStyles>
</p:sldMaster>`;
}

function createSlideLayoutXml(themeConfig) {
  const headingFont = getFirstFontFamily(themeConfig?.heading?.fontFamily, 'Calibri');
  const bodyFont = getFirstFontFamily(themeConfig?.body?.fontFamily, 'Calibri');
  const headingColor = ensureThemeHex(themeConfig?.heading?.color || '#111111', 'FFFFFF');
  const bodyColor = ensureThemeHex(themeConfig?.body?.color || '#333333', 'F8F8F8');
  const titleTxBody = buildPlaceholderTxBodyXml(headingColor, headingFont, 4800);
  const bodyTxBody = buildPlaceholderTxBodyXml(bodyColor, bodyFont, 3200);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="title" preserve="1">
  <p:cSld name="Title and Content">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title" idx="0"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="274320"/>
            <a:ext cx="8229600" cy="1021080"/>
          </a:xfrm>
        </p:spPr>
        ${titleTxBody}
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1508760"/>
            <a:ext cx="8229600" cy="4114800"/>
          </a:xfrm>
        </p:spPr>
        ${bodyTxBody}
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`;
}

function createSlideMasterRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function createSlideLayoutRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function buildOfficeThemePackage(themeConfig) {
  const colors = buildThemeColorSet(themeConfig);
  return {
    colors,
    files: {
      'ppt/theme/theme1.xml': createThemeXml(themeConfig, colors),
      'ppt/slideMasters/slideMaster1.xml': createSlideMasterXml(themeConfig, colors),
      'ppt/slideMasters/_rels/slideMaster1.xml.rels': createSlideMasterRelationshipsXml(),
      'ppt/slideLayouts/slideLayout1.xml': createSlideLayoutXml(themeConfig),
      'ppt/slideLayouts/_rels/slideLayout1.xml.rels': createSlideLayoutRelationshipsXml(),
    },
  };
}

function defaultRelationshipsXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n</Relationships>';
}

function ensureOverrideEntry(xml, entry) {
  if (xml.includes(`PartName="${entry.partName}"`)) {
    return xml;
  }
  return xml.replace('</Types>', `  <Override PartName="${entry.partName}" ContentType="${entry.contentType}"/>\n</Types>`);
}

async function ensureContentTypes(zip) {
  const ctPath = '[Content_Types].xml';
  if (!zip.file(ctPath)) return;
  let xml = await zip.file(ctPath).async('string');
  const overrides = [
    { partName: '/ppt/theme/theme1.xml', contentType: 'application/vnd.openxmlformats-officedocument.theme+xml' },
    { partName: '/ppt/slideMasters/slideMaster1.xml', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml' },
    { partName: '/ppt/slideLayouts/slideLayout1.xml', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml' },
  ];
  overrides.forEach((entry) => {
    xml = ensureOverrideEntry(xml, entry);
  });
  zip.file(ctPath, xml);
}

function ensureRelationshipEntry(xml, rel) {
  if (xml.includes(`Target="${rel.target}"`)) {
    return xml;
  }
  return xml.replace('</Relationships>', `  <Relationship Id="${rel.id}" Type="${rel.type}" Target="${rel.target}"/>\n</Relationships>`);
}

async function ensurePresentationRelationships(zip) {
  const relPath = 'ppt/_rels/presentation.xml.rels';
  let relXml = zip.file(relPath) ? await zip.file(relPath).async('string') : defaultRelationshipsXml();
  relXml = ensureRelationshipEntry(relXml, {
    id: PPT_THEME_REL_IDS.master,
    type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster',
    target: 'slideMasters/slideMaster1.xml',
  });
  zip.file(relPath, relXml);
}

async function ensureSlideRelationships(zip) {
  const slideRegex = /^ppt\/slides\/slide(\d+)\.xml$/;
  const slideFiles = Object.keys(zip.files).filter((name) => slideRegex.test(name));
  await Promise.all(
    slideFiles.map(async (slidePath) => {
      const match = slidePath.match(slideRegex);
      if (!match) return;
      const relPath = `ppt/slides/_rels/slide${match[1]}.xml.rels`;
      let relXml = zip.file(relPath) ? await zip.file(relPath).async('string') : defaultRelationshipsXml();
      relXml = ensureRelationshipEntry(relXml, {
        id: PPT_THEME_REL_IDS.layout,
        type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout',
        target: '../slideLayouts/slideLayout1.xml',
      });
      zip.file(relPath, relXml);
    })
  );
}

function injectPresentationThemeMetadata(xml, themeConfig) {
  let updatedXml = xml;
  if (!updatedXml.includes('<p:sldMasterIdLst')) {
    updatedXml = updatedXml.replace(
      '<p:sldIdLst',
      `<p:sldMasterIdLst>\n    <p:sldMasterId id="2147483648" r:id="${PPT_THEME_REL_IDS.master}"/>\n  </p:sldMasterIdLst>\n  <p:sldIdLst`
    );
  }
  if (!updatedXml.includes('<p:defaultTextStyle')) {
    updatedXml = updatedXml.replace('</p:presentation>', `  ${buildDefaultTextStyleXml(themeConfig)}\n</p:presentation>`);
  }
  if (!updatedXml.includes('<p:themeId>')) {
    updatedXml = updatedXml.replace('</p:presentation>', '  <p:themeId>1</p:themeId>\n</p:presentation>');
  }
  return updatedXml;
}

async function ensurePresentationThemeMetadata(zip, themeConfig) {
  const presPath = 'ppt/presentation.xml';
  if (!zip.file(presPath)) return;
  const xml = await zip.file(presPath).async('string');
  const updated = injectPresentationThemeMetadata(xml, themeConfig);
  zip.file(presPath, updated);
}

async function injectThemePackage(arrayBuffer, themeConfig = DEFAULT_THEME) {
  const zipLib = typeof JSZip !== 'undefined' ? JSZip : window?.JSZip;
  if (!zipLib) {
    console.warn('JSZip not available. Skipping theme injection.');
    return arrayBuffer;
  }
  try {
    const zip = await zipLib.loadAsync(arrayBuffer);
    const themePackage = buildOfficeThemePackage(themeConfig);
    Object.entries(themePackage.files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    await ensureContentTypes(zip);
    await ensurePresentationRelationships(zip);
    await ensureSlideRelationships(zip);
    await ensurePresentationThemeMetadata(zip, themeConfig);

    return zip.generateAsync({ type: 'arraybuffer' });
  } catch (error) {
    console.warn('Failed to inject theme package. Returning original PPTX.', error);
    return arrayBuffer;
  }
}

function makeSlide(template = 'blank', themeId = DEFAULT_THEME.id) {
  const themeConfig = resolveTheme(themeId);
  const slide = {
    id: uid('slide'),
    background: themeConfig.slideBackground,
    elements: []
  };

  switch(template) {
    case 'title':
      // Title Slide (centered title and subtitle)
      slide.elements.push(createThemedTextElement({
        placeholder: 'Click to edit title',
        x: 80,
        y: 180,
        w: 800,
        h: 100,
        textAlign: 'center',
        themeConfig,
        variant: 'heading',
        styles: { fontSize: 48, fontWeight: 'bold' }
      }));
      slide.elements.push(createThemedTextElement({
        placeholder: 'Click to edit subtitle',
        x: 80,
        y: 320,
        w: 800,
        h: 80,
        textAlign: 'center',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 24, color: '#666' }
      }));
      break;

    case 'title-content':
      // Title and Content (title with bullet points)
      slide.elements.push(createThemedTextElement({
        placeholder: 'Click to edit title',
        x: 60,
        y: 50,
        w: 840,
        h: 60,
        textAlign: 'left',
        themeConfig,
        variant: 'heading',
        styles: { fontSize: 36, fontWeight: 'bold' }
      }));
      slide.elements.push(createThemedTextElement({
        placeholder: '• First point\n• Second point\n• Third point',
        x: 80,
        y: 140,
        w: 800,
        h: 400,
        textAlign: 'left',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 24, lineHeight: 1.5 },
        listStyle: 'bullet'
      }));
      break;

    case 'section-header':
      // Section Header (centered section title with background)
      slide.background = '#F3F4F6';
      slide.elements.push({
        id: uid('shape'),
        type: 'rect',
        x: 0,
        y: 200,
        w: 960,
        h: 120,
        fill: themeConfig.primaryColor || '#8B5CF6',
        stroke: 'none',
        zIndex: 1
      });
      slide.elements.push(createThemedTextElement({
        placeholder: 'SECTION TITLE',
        x: 80,
        y: 230,
        w: 800,
        h: 60,
        textAlign: 'center',
        themeConfig: { ...themeConfig, textColor: '#FFFFFF' },
        variant: 'heading',
        styles: { 
          fontSize: 32, 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }
      }));
      break;

    case 'two-content':
      // Two Content (title with two columns)
      slide.elements.push(createThemedTextElement({
        placeholder: 'Click to edit title',
        x: 60,
        y: 50,
        w: 840,
        h: 60,
        textAlign: 'left',
        themeConfig,
        variant: 'heading',
        styles: { fontSize: 36, fontWeight: 'bold' }
      }));
      
      // Left column
      slide.elements.push(createThemedTextElement({
        placeholder: 'Left content',
        x: 60,
        y: 140,
        w: 410,
        h: 400,
        textAlign: 'left',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 20, lineHeight: 1.5 }
      }));
      
      // Right column
      slide.elements.push(createThemedTextElement({
        placeholder: 'Right content',
        x: 490,
        y: 140,
        w: 410,
        h: 400,
        textAlign: 'left',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 20, lineHeight: 1.5 }
      }));
      break;

    case 'comparison':
      // Comparison (title with two columns and headers)
      slide.elements.push(createThemedTextElement({
        placeholder: 'Comparison',
        x: 60,
        y: 50,
        w: 840,
        h: 60,
        textAlign: 'left',
        themeConfig,
        variant: 'heading',
        styles: { fontSize: 36, fontWeight: 'bold' }
      }));
      
      // Left column header
      slide.elements.push(createThemedTextElement({
        placeholder: 'Feature 1',
        x: 60,
        y: 140,
        w: 410,
        h: 40,
        textAlign: 'center',
        themeConfig,
        variant: 'heading',
        styles: { 
          fontSize: 24, 
          fontWeight: 'bold',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          padding: '8px 0',
          borderRadius: '4px'
        }
      }));
      
      // Right column header
      slide.elements.push(createThemedTextElement({
        placeholder: 'Feature 2',
        x: 490,
        y: 140,
        w: 410,
        h: 40,
        textAlign: 'center',
        themeConfig,
        variant: 'heading',
        styles: { 
          fontSize: 24, 
          fontWeight: 'bold',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          padding: '8px 0',
          borderRadius: '4px'
        }
      }));
      
      // Left column content
      slide.elements.push(createThemedTextElement({
        placeholder: '• Point 1\n• Point 2\n• Point 3',
        x: 80,
        y: 200,
        w: 370,
        h: 300,
        textAlign: 'left',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 20, lineHeight: 1.8 },
        listStyle: 'bullet'
      }));
      
      // Right column content
      slide.elements.push(createThemedTextElement({
        placeholder: '• Point 1\n• Point 2\n• Point 3',
        x: 510,
        y: 200,
        w: 370,
        h: 300,
        textAlign: 'left',
        themeConfig,
        variant: 'body',
        styles: { fontSize: 20, lineHeight: 1.8 },
        listStyle: 'bullet'
      }));
      break;

    case 'blank':
    default:
      // Blank slide (no elements)
      break;
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
    listStyle: ['bullet', 'number', 'none'].includes(styles?.listStyle) ? styles.listStyle : 'none',
    backgroundColor: typeof styles?.backgroundColor === 'string' ? styles.backgroundColor : undefined,
    borderColor: typeof styles?.borderColor === 'string' ? styles.borderColor : undefined,
    borderWidth: Number.isFinite(styles?.borderWidth) ? Math.max(0, styles.borderWidth) : undefined
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
      const styles = normalizeTextStyles(element.styles, themeConfig);
      const rawContent = typeof element.content === 'string' ? element.content : '';
      const trimmedContent = rawContent.trim();
      const rawPlaceholder = typeof element.placeholder === 'string' && element.placeholder.trim()
        ? element.placeholder
        : null;

      let placeholder = rawPlaceholder;
      let content = rawContent;

      if (!placeholder) {
        const legacyMatch = LEGACY_PLACEHOLDER_VALUES.has(rawContent)
          ? rawContent
          : (LEGACY_PLACEHOLDER_VALUES.has(trimmedContent) ? trimmedContent : null);
        if (legacyMatch) {
          const key = getPlaceholderKey(legacyMatch);
          placeholder = key ? DEFAULT_TEXT_PLACEHOLDERS[key] : DEFAULT_TEXT_PLACEHOLDERS.body;
          content = '';
        }
      }

      if (placeholder && (rawContent === placeholder || trimmedContent === (placeholder || '').trim())) {
        content = '';
      }

      return {
        ...base,
        type: 'text',
        styles,
        content,
        placeholder: placeholder || undefined
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
  normalized.name = typeof normalized.name === 'string' && normalized.name.trim() ? normalized.name : '';
  normalized.selectedThemeId = typeof normalized.selectedThemeId === 'string' && THEMES_BY_ID[normalized.selectedThemeId]
    ? normalized.selectedThemeId
    : DEFAULT_THEME.id;
  const themeConfig = resolveTheme(normalized.selectedThemeId);

  if (!Array.isArray(normalized.slides) || normalized.slides.length === 0) {
    normalized.slides = [makeSlide('title', normalized.selectedThemeId)];
  } else {
    normalized.slides = normalized.slides.map((slide) => {
      if (!slide || typeof slide !== 'object') return makeSlide('blank', normalized.selectedThemeId);
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
    normalized.slides = [makeSlide('blank', normalized.selectedThemeId)];
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
  onSave,
  onLoad,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPresent,
  isPresenting,
  presentationName,
  onChangeName,
  onChangeBackground,
  currentSlide,
  onSelectTheme,
  selectedThemeId,
  currentTheme,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel,
  minZoom,
  maxZoom,
}) {
  const fileRef = useRef();
  const backgroundButtonRef = useRef();
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showChartsMenu, setShowChartsMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showSlideLayouts, setShowSlideLayouts] = useState(false);
  const [showThemeGallery, setShowThemeGallery] = useState(false);
  const layoutsButtonRef = useRef(null);
  const layoutButtonRect = layoutsButtonRef.current?.getBoundingClientRect();
  const themeButtonRef = useRef(null);
  const themeButtonRect = themeButtonRef.current?.getBoundingClientRect();
  const layoutDropdownPosition = useMemo(() => {
    if (!layoutButtonRect) return null;

    const dropdownWidth = 500;
    const halfWidth = dropdownWidth / 2;
    const edgePadding = 16;
    const buttonCenter = layoutButtonRect.left + (layoutButtonRect.width / 2);
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : null;

    if (!viewportWidth) {
      return {
        top: layoutButtonRect.bottom,
        left: buttonCenter,
      };
    }

    if (viewportWidth <= dropdownWidth + edgePadding * 2) {
      return {
        top: layoutButtonRect.bottom,
        left: viewportWidth / 2,
      };
    }

    const minCenter = halfWidth + edgePadding;
    const maxCenter = viewportWidth - halfWidth - edgePadding;
    const clampedCenter = Math.min(Math.max(buttonCenter, minCenter), maxCenter);

    return {
      top: layoutButtonRect.bottom,
      left: clampedCenter,
    };
  }, [layoutButtonRect]);

  const themeDropdownPosition = useMemo(() => {
    if (!themeButtonRect) return null;

    const dropdownWidth = 680;
    const halfWidth = dropdownWidth / 2;
    const edgePadding = 16;
    const buttonCenter = themeButtonRect.left + (themeButtonRect.width / 2);
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : null;

    const top = themeButtonRect.bottom + 8;

    if (!viewportWidth) {
      return {
        top,
        left: buttonCenter,
      };
    }

    if (viewportWidth <= dropdownWidth + edgePadding * 2) {
      return {
        top,
        left: viewportWidth / 2,
      };
    }

    const minCenter = halfWidth + edgePadding;
    const maxCenter = viewportWidth - halfWidth - edgePadding;
    const clampedCenter = Math.min(Math.max(buttonCenter, minCenter), maxCenter);

    return {
      top,
      left: clampedCenter,
    };
  }, [themeButtonRect]);

  const safeZoomLevel = Number.isFinite(zoomLevel) ? zoomLevel : 1;
  const minAllowedZoom = Number.isFinite(minZoom) ? minZoom : 0.25;
  const maxAllowedZoom = Number.isFinite(maxZoom) ? maxZoom : 3;
  const zoomDisplay = `${Math.round(safeZoomLevel * 100)}%`;
  const isZoomOutDisabled = safeZoomLevel - minAllowedZoom <= 0.0001;
  const isZoomInDisabled = maxAllowedZoom - safeZoomLevel <= 0.0001;

  const handleNameInputKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const blurAndSave = () => {
        if (document.activeElement === e.currentTarget) {
          e.currentTarget.blur();
        }
        if (onSave) onSave();
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(blurAndSave);
      } else {
        setTimeout(blurAndSave, 0);
      }
    }
  }, [onSave]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.ribbon-btn') && !e.target.closest('.ribbon-dropdown-menu') && !e.target.closest('.theme-gallery')) {
        setShowShapesMenu(false);
        setShowChartsMenu(false);
        setShowBackgroundMenu(false);
        setShowCustomColorPicker(false);
        setShowSlideLayouts(false);
        setShowThemeGallery(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const backgroundColorOptions = [
    '#FFFFFF', '#F3E8FF', '#E0F2FE', '#FCE7F3',
    '#A78BFA', '#8B5CF6', '#38BDF8', '#1E3A8A',
    '#111827', '#F97316', '#10B981', '#F9A8D4'
  ];

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
        <div className="file-menu-item" onClick={onExport} title="Export presentation" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && onExport()}>
          <div className="file-menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16a2 2 0 0 1 2 2v6" />
              <path d="M16 14l-4 4-4-4" />
              <path d="M12 10v8" />
              <path d="M4 18h16" />
            </svg>
          </div>
          <div className="file-menu-content">
            <div className="file-menu-title">Export</div>
            <div className="file-menu-desc">Download themed PowerPoint</div>
          </div>
        </div>
        <div className="file-menu-item" onClick={onLoad} title="Open saved presentation" tabIndex={0} 
             onKeyDown={(e) => e.key === 'Enter' && onLoad()}>
          <div className="file-menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </div>
          <div className="file-menu-content">
            <div className="file-menu-title">Open</div>
            <div className="file-menu-desc">Load saved presentation</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="toolbar-group">
      <div className="tool-section">
        <label className="section-label">Slides</label>
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

  const renderThemeCard = (theme) => {
    const isSelected = theme.id === selectedThemeId;
    const sampleAccent = Array.isArray(theme.accentColors) ? theme.accentColors.slice(0, 5) : [];
    const headingFont = theme.heading?.fontFamily || 'Segoe UI';
    const bodyFont = theme.body?.fontFamily || 'Segoe UI';

    return (
      <button
        key={theme.id}
        type="button"
        className={`theme-card${isSelected ? ' theme-card--selected' : ''}`}
        onClick={() => {
          if (onSelectTheme) onSelectTheme(theme.id);
          setShowThemeGallery(false);
        }}
      >
        <div className="theme-card__preview">
          <div
            className="theme-card__slide"
            style={{
              background: theme.slideBackground,
            }}
          >
            <div
              className="theme-card__title"
              style={{
                fontFamily: headingFont,
                color: theme.heading?.color || theme.textColor,
              }}
            >
              {theme.name}
            </div>
            <div
              className="theme-card__subtitle"
              style={{
                fontFamily: bodyFont,
                color: theme.body?.color || theme.textColor,
              }}
            >
              Presentation Theme
            </div>
            <div className="theme-card__accents">
              {sampleAccent.map((color) => (
                <span
                  key={color}
                  className="theme-card__accent"
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const resolvedBackground = (() => {
    const slideBg = currentSlide?.background;
    if (typeof slideBg === 'string') {
      if (/^#([0-9a-fA-F]{3,8})$/.test(slideBg)) {
        return slideBg.length === 4
          ? `#${slideBg[1]}${slideBg[1]}${slideBg[2]}${slideBg[2]}${slideBg[3]}${slideBg[3]}`
          : slideBg.slice(0, 7);
      }
      if (/^rgb/i.test(slideBg)) {
        const match = slideBg.match(/rgb\s*\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (match) {
          const [r, g, b] = match.slice(1, 4).map((n) => {
            const num = Math.max(0, Math.min(255, parseInt(n, 10) || 0));
            return num.toString(16).padStart(2, '0');
          });
          return `#${r}${g}${b}`;
        }
      }
    }
    return DEFAULT_THEME.slideBackground;
  })();

  return (
    <div className="toolbar-compact">
      <div className="toolbar-content ribbon-layout" id="toolbar-content">
          {/* File */}
          <div className="ribbon-section">
            <span className="ribbon-section-label">File</span>
            <div className="ribbon-section-content">
              <button onClick={onSave} title="Save (Ctrl+S)" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
                </svg>
              </button>
              <button onClick={onExport} title="Export (.pptx)" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16a2 2 0 0 1 2 2v6" />
                  <path d="M16 14l-4 4-4-4" />
                  <path d="M12 10v8" />
                  <path d="M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="ribbon-divider"></div>

          {/* Edit */}
          <div className="ribbon-section">
            <span className="ribbon-section-label">Edit</span>
            <div className="ribbon-section-content">
              <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                </svg>
              </button>
              <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="ribbon-divider"></div>

          {/* View / Zoom */}
          <div className="ribbon-section">
            <span className="ribbon-section-label">Zoom</span>
            <div className="ribbon-section-content ribbon-zoom-controls">
              <button
                type="button"
                className="ribbon-btn"
                onClick={() => onZoomOut?.()}
                disabled={isZoomOutDisabled}
                title="Zoom out"
                aria-label="Zoom out"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className="ribbon-btn ribbon-btn--label"
                onClick={() => onZoomReset?.()}
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                {zoomDisplay}
              </button>
              <button
                type="button"
                className="ribbon-btn"
                onClick={() => onZoomIn?.()}
                disabled={isZoomInDisabled}
                title="Zoom in"
                aria-label="Zoom in"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="ribbon-divider"></div>

          {/* Slides */}
          <div className="ribbon-section">
            <span className="ribbon-section-label">Slides</span>
            <div className="ribbon-section-content">
              <div style={{ position: 'relative' }}>
                <button 
                  ref={layoutsButtonRef}
                  onClick={(e) => { 
                    setShowSlideLayouts(!showSlideLayouts);
                    setShowShapesMenu(false);
                    setShowChartsMenu(false);
                    setShowBackgroundMenu(false);
                  }} 
                  title="Add slide with layout" 
                  className="ribbon-btn"
                  id="layouts-dropdown-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 9L2 5h8z"/>
                  </svg>
                </button>
                {showThemeGallery && (
                  <div
                    className="theme-gallery"
                    style={{
                      top: themeDropdownPosition ? `${themeDropdownPosition.top}px` : '120px',
                      left: themeDropdownPosition ? `${themeDropdownPosition.left}px` : '50%',
                      transform: 'translateX(-50%)',
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="theme-gallery__header">
                      <div>
                        <h3>Themes</h3>
                      </div>
                      <button
                        type="button"
                        className="theme-gallery__close"
                        aria-label="Close theme gallery"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setShowThemeGallery(false);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="theme-gallery__grid">
                      {THEMES.map(renderThemeCard)}
                    </div>
                  </div>
                )}
                {showSlideLayouts && (
                  <div 
                    className="slide-layouts-dropdown ribbon-dropdown-menu"
                    style={{
                      width: '500px',
                      padding: '16px',
                      maxHeight: '60vh',
                      overflowY: 'auto',
                      transform: 'translateX(-50%)',
                      ...(layoutDropdownPosition
                        ? {
                            top: `${layoutDropdownPosition.top}px`,
                            left: `${layoutDropdownPosition.left}px`
                          }
                        : {
                            left: '50%',
                            top: '72px'
                          })
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2d3748' }}>Choose a Layout</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('title'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Title Slide"
                      >
                        <div style={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ width: '60%', height: '12px', backgroundColor: '#4f46e5', borderRadius: '2px', marginBottom: '6px' }}></div>
                          <div style={{ width: '40%', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Title</span>
                      </div>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('title-content'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Title and Content"
                      >
                        <div style={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          padding: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ width: '60%', height: '10px', backgroundColor: '#4f46e5', borderRadius: '2px', marginBottom: '8px' }}></div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '4px' }}></div>
                          <div style={{ width: '90%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '4px' }}></div>
                          <div style={{ width: '80%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Title and Content</span>
                      </div>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('section-header'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Section Header"
                      >
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>SECTION</div>
                          <div style={{ width: '70%', height: '10px', backgroundColor: '#4f46e5', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Section Header</span>
                      </div>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('two-content'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Two Content"
                      >
                        <div style={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          padding: '8px',
                          marginBottom: '8px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ width: '50%', height: '8px', backgroundColor: '#4f46e5', borderRadius: '2px', marginBottom: '8px' }}></div>
                          <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ width: '80%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ width: '80%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Two Content</span>
                      </div>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('comparison'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Comparison"
                      >
                        <div style={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          padding: '8px',
                          marginBottom: '8px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ width: '60%', height: '8px', backgroundColor: '#4f46e5', borderRadius: '2px', marginBottom: '12px' }}></div>
                          <div style={{ display: 'flex', flex: 1, gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <div style={{ fontSize: '8px', color: '#94a3b8', alignSelf: 'flex-start' }}>COMPARISON</div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ width: '80%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <div style={{ fontSize: '8px', color: '#94a3b8', alignSelf: 'flex-start' }}>COMPARISON</div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ width: '80%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Comparison</span>
                      </div>
                      <div 
                        className="layout-option" 
                        onClick={() => { onAddSlide('blank'); setShowSlideLayouts(false); }}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        title="Blank"
                      >
                        <div style={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          height: '80px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: '8px',
                          backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                        }}>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>Blank</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  ref={backgroundButtonRef}
                  type="button"
                  className="ribbon-btn"
                  title="Background color"
                  onClick={() => {
                    setShowBackgroundMenu(prev => !prev);
                    setShowShapesMenu(false);
                    setShowChartsMenu(false);
                    setShowCustomColorPicker(false);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="14" rx="2" ry="2"/>
                    <path d="M3 10h18"/>
                    <path d="M10 15l2 2 4-4"/>
                  </svg>
                </button>
                {showBackgroundMenu && (
                  <div
                    className="ribbon-dropdown-menu"
                    style={{
                      top: `${(backgroundButtonRef.current?.getBoundingClientRect().bottom || 0) + window.scrollY}px`,
                      left: `${(backgroundButtonRef.current?.getBoundingClientRect().left || 0) + (backgroundButtonRef.current?.getBoundingClientRect().width || 0) / 2 + window.scrollX}px`,
                      transform: 'translateX(-50%)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 28px)',
                        gap: '8px'
                      }}
                    >
                      {backgroundColorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            onChangeBackground?.(color);
                            setShowBackgroundMenu(false);
                            setShowCustomColorPicker(false);
                          }}
                          className="ribbon-color-swatch"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: color.toLowerCase() === (resolvedBackground || '').toLowerCase() ? '2px solid rgba(139,92,246,0.8)' : '1px solid rgba(148, 163, 184, 0.4)',
                            background: color,
                            cursor: 'pointer',
                            padding: 0
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setShowCustomColorPicker(prev => !prev);
                      }}
                      className="ribbon-dropdown-item"
                      type="button"
                    >
                      More colors…
                    </button>
                    {showCustomColorPicker && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '4px 6px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.6)',
                          boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.35)'
                        }}
                      >
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Custom:</span>
                        <input
                          type="color"
                          value={resolvedBackground}
                          onChange={(e) => onChangeBackground?.(e.target.value)}
                          title="Background color"
                          aria-label="Slide background color"
                          style={{
                            width: '36px',
                            height: '24px',
                            border: 'none',
                            background: 'transparent',
                            padding: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ribbon-divider"></div>

          {/* Insert */}
          <div className="ribbon-section">
            <span className="ribbon-section-label">Insert</span>
            <div className="ribbon-section-content">
              <button onClick={onAddText} title="Text box" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/>
                  <line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
              </button>
              <button onClick={() => fileRef.current && fileRef.current.click()} title="Image" className="ribbon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
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
              {/* Shapes Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => { 
                    setShowShapesMenu(!showShapesMenu); 
                    setShowChartsMenu(false);
                    setShowBackgroundMenu(false);
                  }} 
                  title="Shapes" 
                  className="ribbon-btn"
                  id="shapes-dropdown-btn"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="6" width="18" height="12" rx="2" ry="2"/>
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 9L2 5h8z"/>
                  </svg>
                </button>
                {showShapesMenu && (
                  <div 
                    className="ribbon-dropdown-menu"
                    style={{
                      top: document.getElementById('shapes-dropdown-btn')?.getBoundingClientRect().bottom + 'px',
                      left: (document.getElementById('shapes-dropdown-btn')?.getBoundingClientRect().left + 
                             document.getElementById('shapes-dropdown-btn')?.getBoundingClientRect().width / 2) + 'px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <button 
                      onClick={() => { onAddShape('rect'); setShowShapesMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="6" width="18" height="12" rx="2" ry="2"/>
                      </svg>
                      <span>Rectangle</span>
                    </button>
                    <button 
                      onClick={() => { onAddShape('circle'); setShowShapesMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9"/>
                      </svg>
                      <span>Circle</span>
                    </button>
                    <button 
                      onClick={() => { onAddShape('line'); setShowShapesMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                      </svg>
                      <span>Line</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Charts Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => { setShowChartsMenu(!showChartsMenu); setShowShapesMenu(false); setShowBackgroundMenu(false); setShowCustomColorPicker(false); }} 
                  title="Charts" 
                  className="ribbon-btn"
                  id="charts-dropdown-btn"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 9L2 5h8z"/>
                  </svg>
                </button>
                {showChartsMenu && (
                  <div 
                    className="ribbon-dropdown-menu"
                    style={{
                      top: document.getElementById('charts-dropdown-btn')?.getBoundingClientRect().bottom + 'px',
                      left: (document.getElementById('charts-dropdown-btn')?.getBoundingClientRect().left + 
                             document.getElementById('charts-dropdown-btn')?.getBoundingClientRect().width / 2) + 'px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <button 
                      onClick={() => { onAddChart('bar'); setShowChartsMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="16"/>
                      </svg>
                      <span>Bar Chart</span>
                    </button>
                    <button 
                      onClick={() => { onAddChart('line'); setShowChartsMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 17 9 11 13 15 21 7"/>
                        <polyline points="14 7 21 7 21 14"/>
                      </svg>
                      <span>Line Chart</span>
                    </button>
                    <button 
                      onClick={() => { onAddChart('pie'); setShowChartsMenu(false); }}
                      className="ribbon-dropdown-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                      </svg>
                      <span>Pie Chart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ribbon-divider"></div>

          {/* Themes */}
          <div className="ribbon-section ribbon-section--design">
            <span className="ribbon-section-label">Themes</span>
            <div className="ribbon-section-content ribbon-section-content--design">
              <button
                ref={themeButtonRef}
                type="button"
                className={`ribbon-btn theme-picker-btn${showThemeGallery ? ' open' : ''}`}
                title="Browse themes"
                aria-expanded={showThemeGallery}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setShowThemeGallery((prev) => !prev);
                  setShowSlideLayouts(false);
                  setShowShapesMenu(false);
                  setShowChartsMenu(false);
                  setShowBackgroundMenu(false);
                  setShowCustomColorPicker(false);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h10" />
                  <circle cx="7" cy="12" r="1.5" />
                  <circle cx="12" cy="9" r="1.5" />
                  <circle cx="16.5" cy="12.5" r="1.3" />
                </svg>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <path d="M6 9L2 5h8z" />
                </svg>
              </button>
            </div>
            {showThemeGallery && (
              <div
                className="theme-gallery"
                style={{
                  top: themeDropdownPosition ? `${themeDropdownPosition.top}px` : '120px',
                  left: themeDropdownPosition ? `${themeDropdownPosition.left}px` : '50%',
                  transform: 'translateX(-50%)',
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="theme-gallery__header">
                  <div>
                    <h3>Themes</h3>
                    <p></p>
                  </div>
                  <button
                    type="button"
                    className="theme-gallery__close"
                    aria-label="Close theme gallery"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setShowThemeGallery(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="theme-gallery__grid">
                  {THEMES.map(renderThemeCard)}
                </div>
              </div>
            )}
          </div>

          <div className="ribbon-divider"></div>

          {/* Presentation Name & Present */}
          <div className="ribbon-section ribbon-section-presentation">
            <div className="ribbon-section-content ribbon-presentation-content">
              <input
                className="name-input-ribbon"
                value={presentationName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="📄 Untitled"
                onKeyDown={handleNameInputKeyDown}
              />
              <button
                className="present-btn-ribbon"
                onClick={onPresent}
                title={isPresenting ? 'Exit fullscreen (Esc)' : 'Present fullscreen'}
                aria-label={isPresenting ? 'Exit fullscreen' : 'Present fullscreen'}
                aria-pressed={isPresenting || false}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

function SlideThumb({
  slide,
  index,
  active,
  onClick,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragEnd,
  isDragging,
  isDragOver,
}) {
  const thumbRef = useRef();
  const innerRef = useRef(null);
  const [thumbScale, setThumbScale] = useState(0.18);

  const updateThumbScale = useCallback((width) => {
    if (!width) return;
    const nextScale = width / CANVAS_BASE_WIDTH;
    setThumbScale(prevScale => (Math.abs(prevScale - nextScale) > 0.0005 ? nextScale : prevScale));
  }, []);

  useEffect(() => {
    const node = innerRef.current;
    if (!node) return undefined;

    const measure = () => {
      updateThumbScale(node.clientWidth);
    };

    measure();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          updateThumbScale(entry.contentRect.width);
        });
      });
      resizeObserver.observe(node);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', measure);
      }
    };
  }, [updateThumbScale]);

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

  // Calculate scale for thumbnail (based on available width)
  const thumbHeight = CANVAS_BASE_HEIGHT * thumbScale;

  const renderThumbElement = (el) => {
    const style = {
      position: 'absolute',
      left: el.x * thumbScale,
      top: el.y * thumbScale,
      width: el.w * thumbScale,
      height: el.h * thumbScale,
      transform: `rotate(${el.rotation || 0}deg)`,
      pointerEvents: 'none',
      borderRadius: '3px',
    };

    if (el.type === 'text') {
      const backgroundColor = el.styles?.backgroundColor ? `${el.styles.backgroundColor}` : 'transparent';
      const borderColor = el.styles?.borderColor;
      const borderWidthValue = Number.isFinite(el.styles?.borderWidth) ? Math.max(0, el.styles.borderWidth) : (borderColor ? 1.5 : 0);
      return (
        <div key={el.id} style={style} className="thumb-text-el">
          <div
            style={{
              width: '100%',
              height: '100%',
              fontSize: Math.max((el.styles?.fontSize || 18) * thumbScale, 6),
              color: el.styles?.color || '#111111',
              fontWeight: el.styles?.fontWeight || 'normal',
              fontStyle: el.styles?.fontStyle || 'normal',
              textDecoration: el.styles?.textDecoration || 'none',
              textAlign: el.styles?.textAlign || 'left',
              fontFamily: el.styles?.fontFamily || 'Arial',
              lineHeight: Math.max(el.styles?.lineHeight || 1.2, 1.1),
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              hyphens: 'auto',
              background: backgroundColor,
              border: borderColor && borderWidthValue > 0 ? `${Math.max(1, borderWidthValue * thumbScale)}px solid ${borderColor}` : `${Math.max(1, borderWidthValue * thumbScale || 1)}px solid transparent`,
              borderRadius: '6px',
              padding: `${4 * thumbScale}px ${6 * thumbScale}px`,
            }}
          >
            {el.content || ''}
          </div>
        </div>
      );
    }

    if (el.type === 'image') {
      return (
        <div key={el.id} style={style} className="thumb-image-el">
          <img
            src={el.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
            }}
          />
        </div>
      );
    }

    if (el.type === 'chart') {
      return (
        <div
          key={el.id}
          style={{ ...style, overflow: 'hidden' }}
          className="thumb-chart-el"
        >
          <div
            style={{
              width: el.w,
              height: el.h,
              transform: `scale(${thumbScale})`,
              transformOrigin: 'top left',
            }}
          >
            <ChartElement element={el} scale={1} />
          </div>
        </div>
      );
    }

    if (el.type === 'shape') {
      return (
        <div key={el.id} style={style} className="thumb-shape-el">
          <div
            style={{
              width: '100%',
              height: '100%',
              background: el.fill || '#3b82f6',
              border: `1px solid ${el.stroke || 'rgba(15,23,42,0.35)'}`,
              borderRadius: el.shapeType === 'circle' ? '50%' : '6px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Add subtle inner highlight for professional look */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                borderRadius: el.shapeType === 'circle' ? '50%' : '6px',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      );
    }

    return null;
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
      <div
        ref={innerRef}
        className="slide-thumb-inner"
        style={{
          background: slide.background,
          width: '100%',
          height: thumbHeight,
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
        onClick={onClick}
      >
        {slide.elements.map(renderThumbElement)}
      </div>
      <div className="slide-thumb-footer">
        <div className="slide-num">{index + 1}</div>
        <div className="slide-actions">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDuplicate) onDuplicate();
            }}
            title="Duplicate slide"
            className="slide-action-btn"
            aria-label="Duplicate slide"
          >
            ⧉
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete();
            }}
            title="Delete slide"
            className="slide-action-btn delete"
            aria-label="Delete slide"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function ChartElement({ element, scale = 1 }) {
  const ref = useRef();
  const chartRef = useRef(null);

  useEffect(()=>{
    if (!ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    canvas.width = element.w * scale;
    canvas.height = element.h * scale;

    const chartType = element.chartType || 'bar';
    const labels = element.data?.labels || ['A','B','C'];
    const datasets = (element.data?.datasets || [{ label: 'Series', values: [3,5,2], color: '#4e79a7' }]).map(ds => {
      const baseColor = ds.color || '#4e79a7';
      const result = {
        label: ds.label || 'Series',
        data: ds.values || [],
        borderColor: baseColor,
        borderWidth: 1,
      };
      if (chartType === 'pie') {
        const palette = Array.isArray(ds.segmentColors) && ds.segmentColors.length
          ? ds.segmentColors
          : Array.isArray(ds.colors) && ds.colors.length
            ? ds.colors
            : baseColor
              ? [baseColor]
              : DEFAULT_CHART_COLORS;
        result.backgroundColor = labels.map((_, idx) => palette[idx % palette.length]);
      } else {
        result.backgroundColor = baseColor;
      }
      return result;
    });

    const data = { labels, datasets };

    const baseFont = {
      family: 'Inter, "Segoe UI", sans-serif',
      size: 10,
      weight: '500',
    };

    const options = {
      responsive: false,
      maintainAspectRatio: false,
      animation: false, // Disable animations to prevent fluctuation
      hover: {
        animationDuration: 0 // Disable hover animations
      },
      plugins: {
        legend: {
          display: datasets.length > 1 || chartType === 'pie',
          position: 'top',
          labels: {
            font: baseFont,
            color: '#1f2937',
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        tooltip: {
          titleFont: baseFont,
          bodyFont: baseFont,
        },
      },
      scales: chartType !== 'pie' ? {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: baseFont,
            color: '#475569',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.35)',
          },
        },
        x: {
          ticks: {
            maxRotation: 0,
            font: baseFont,
            color: '#475569',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.25)',
          },
        }
      } : {}
    };

    try {
      const chart = new Chart(ctx, { type: chartType, data, options });
      chartRef.current = chart;
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [element.id, element.chartType, element.data, scale]); // More specific dependencies to prevent unnecessary re-renders

  return <canvas ref={ref} style={{ width: '100%', height: '100%' }} />;
}

function ShapeElement({ element, scale = 1 }) {
  const { shapeType, fill, stroke, strokeWidth, w, h } = element;
  const sw = strokeWidth || 2;
  const scaledStrokeWidth = sw * scale;
  const halfStroke = sw / 2;
  
  const svgStyle = {
    width: '100%', 
    height: '100%', 
    overflow: 'visible'
  };
  
  if (shapeType === 'rect') {
    return (
      <svg 
        width={w * scale} 
        height={h * scale} 
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <rect 
          x={halfStroke} 
          y={halfStroke} 
          width={w - sw} 
          height={h - sw} 
          fill={fill||'#4e79a7'} 
          stroke={stroke||'#000'} 
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shapeType === 'square') {
    const size = Math.min(w, h);
    const offsetX = (w - size) / 2;
    const offsetY = (h - size) / 2;
    return (
      <svg 
        width={w * scale} 
        height={h * scale} 
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <rect 
          x={offsetX + halfStroke} 
          y={offsetY + halfStroke} 
          width={size - sw} 
          height={size - sw} 
          fill={fill||'#4e79a7'} 
          stroke={stroke||'#000'} 
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shapeType === 'circle') {
    const r = Math.min(w, h) / 2 - halfStroke;
    return (
      <svg 
        width={w * scale} 
        height={h * scale} 
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <circle 
          cx={w / 2} 
          cy={h / 2} 
          r={r} 
          fill={fill||'#4e79a7'} 
          stroke={stroke||'#000'} 
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shapeType === 'triangle') {
    const padding = halfStroke;
    const points = `${w/2},${padding} ${w-padding},${h-padding} ${padding},${h-padding}`;
    return (
      <svg 
        width={w * scale} 
        height={h * scale} 
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <polygon 
          points={points} 
          fill={fill||'#4e79a7'} 
          stroke={stroke||'#000'} 
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shapeType === 'line') {
    const y = h / 2;
    return (
      <svg 
        width={w * scale} 
        height={h * scale} 
        viewBox={`0 0 ${w} ${h}`}
        style={svgStyle}
      >
        <line 
          x1={halfStroke} 
          y1={y} 
          x2={w - halfStroke} 
          y2={y} 
          stroke={stroke||'#000'} 
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  return null;
}

// Floating Text Toolbar Component
function FloatingTextToolbar({ element, draggingElementId, onStyleChange, onApplyListStyle, onDelete }) {
  const toolbarRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const styleDropdownRef = useRef(null);
  const alignDropdownRef = useRef(null);
  const spacingDropdownRef = useRef(null);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [spacingMenuOpen, setSpacingMenuOpen] = useState(false);

  const elementId = element?.id;

  const calculateToolbarPosition = useCallback(() => {
    if (!elementId) return;
    const node = document.getElementById(`element-${elementId}`);
    const canvas = document.querySelector('.canvas');
    if (!node || !toolbarRef.current || !canvas) return;

    const rect = node.getBoundingClientRect();
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const gap = 12;
    const minTop = canvasRect.top + 8;
    const maxBottom = Math.min(viewportHeight - toolbarRect.height - 8, canvasRect.bottom - toolbarRect.height - 8);
    
    // Calculate preferred position (above the element)
    let top = rect.top - toolbarRect.height - gap;
    
    // If not enough space above, try below the element
    if (top < minTop) {
      top = rect.bottom + gap;
      
      // If still not enough space below, position it at the bottom of the canvas
      if (top + toolbarRect.height > canvasRect.bottom - 8) {
        top = maxBottom;
      }
    }
    
    // Ensure the toolbar stays within the canvas bounds
    top = Math.max(minTop, Math.min(top, maxBottom));

    let left = rect.left + rect.width / 2 - toolbarRect.width / 2;
    left = Math.max(canvasRect.left + 8, Math.min(left, canvasRect.right - toolbarRect.width - 8));

    setPosition(prev => {
      if (Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5) return prev;
      return { top, left };
    });
  }, [elementId]);

  useEffect(() => {
    if (!elementId) return;

    const updatePosition = () => {
      requestAnimationFrame(calculateToolbarPosition);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [elementId, calculateToolbarPosition]);

  useLayoutEffect(() => {
    if (!elementId) return;
    if (draggingElementId && draggingElementId !== elementId) return;
    calculateToolbarPosition();
  }, [calculateToolbarPosition, element?.x, element?.y, element?.w, element?.h, draggingElementId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target)) {
        setStyleMenuOpen(false);
      }
      if (alignDropdownRef.current && !alignDropdownRef.current.contains(event.target)) {
        setAlignMenuOpen(false);
      }
      if (spacingDropdownRef.current && !spacingDropdownRef.current.contains(event.target)) {
        setSpacingMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setStyleMenuOpen(false);
    setAlignMenuOpen(false);
    setSpacingMenuOpen(false);
  }, [element?.id]);

  if (!element) return null;
  const styles = element.styles || {};
  const hasStyleEmphasis = styles.fontWeight === 'bold' || styles.fontStyle === 'italic' || styles.textDecoration === 'underline';
  const currentAlign = styles.textAlign || 'left';
  const gradientStart = rgbaFromHex('E8D9FF', 0.96) || 'rgba(232, 217, 255, 0.96)';
  const gradientMiddle = rgbaFromHex('DFCCFF', 0.94) || 'rgba(223, 204, 255, 0.94)';
  const gradientEnd = rgbaFromHex('CDE7FF', 0.96) || 'rgba(205, 231, 255, 0.96)';
  const toolbarBackground = `linear-gradient(135deg, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`;
  const toolbarBorder = 'rgba(205, 231, 255, 0.55)';
  const glowColor = 'rgba(173, 196, 235, 0.28)';
  const toolbarTextColor = '#1f273d';

  const toggleStyleProp = (prop, activeValue, inactiveValue = 'normal') => {
    const next = styles[prop] === activeValue ? inactiveValue : activeValue;
    onStyleChange(prop, next);
  };

  const renderStyleIcon = () => {
    const symbols = [];
    if (styles.fontWeight === 'bold') symbols.push('𝐁');
    if (styles.fontStyle === 'italic') symbols.push('𝑰');
    if (styles.textDecoration === 'underline') symbols.push('𝑼');
    if (!symbols.length) {
      return '𝑨𝒂';
    }
    return symbols.join('');
  };

  const renderSpacingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 3h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 13h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.8 5.4L2.8 10.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13.2 5.4L13.2 10.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3.6 6l-0.8 0.8L3.6 7.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.4 10l0.8-0.8-0.8-0.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const renderAlignIcon = (type) => {
    switch (type) {
      case 'center':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="10" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="2" y="7" width="12" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="3" y="11" width="10" height="1.6" rx="0.8" fill="currentColor" />
          </svg>
        );
      case 'right':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5" y="3" width="9" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="3" y="7" width="11" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="7" y="11" width="7" height="1.6" rx="0.8" fill="currentColor" />
          </svg>
        );
      case 'left':
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="9" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="2" y="7" width="11" height="1.6" rx="0.8" fill="currentColor" />
            <rect x="2" y="11" width="7" height="1.6" rx="0.8" fill="currentColor" />
          </svg>
        );
    }
  };

  const spacingOptions = [1, 1.2, 1.5, 1.75, 2];

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar floating-toolbar--text"
      style={{
        top: position.top,
        left: position.left,
        background: toolbarBackground,
        borderColor: toolbarBorder,
        color: toolbarTextColor,
        boxShadow: `0 16px 32px ${glowColor}`
      }}
    >
      <FontDropdown
        value={styles.fontFamily || 'Arial'}
        onChange={(font) => onStyleChange('fontFamily', font)}
        title={`Font family (${styles.fontFamily || 'Arial'})`}
        trigger="icon"
      />

      <input
        type="number"
        min={8}
        max={120}
        value={styles.fontSize || 18}
        onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value || '18', 10))}
        title="Font size"
      />

      <div className="floating-toolbar__dropdown" ref={styleDropdownRef}>
        <button
          className={`dropdown-trigger${hasStyleEmphasis ? ' active' : ''}${styleMenuOpen ? ' open' : ''}`}
          onClick={() => {
            setStyleMenuOpen(prev => !prev);
            setAlignMenuOpen(false);
          }}
          type="button"
          title="Text style"
          aria-label="Text style options"
        >
          <span className="dropdown-icon" aria-hidden="true">{renderStyleIcon()}</span>
          <span className="dropdown-caret">▾</span>
        </button>
        {styleMenuOpen && (
          <div className="floating-toolbar__menu">
            <button
              className={`dropdown-item${styles.fontWeight === 'bold' ? ' active' : ''}`}
              onClick={() => toggleStyleProp('fontWeight', 'bold', 'normal')}
              type="button"
              aria-label="Toggle bold"
            >
              <span className="dropdown-icon" aria-hidden="true">𝐁</span>
            </button>
            <button
              className={`dropdown-item${styles.fontStyle === 'italic' ? ' active' : ''}`}
              onClick={() => toggleStyleProp('fontStyle', 'italic', 'normal')}
              type="button"
              aria-label="Toggle italic"
            >
              <span className="dropdown-icon" aria-hidden="true">𝑰</span>
            </button>
            <button
              className={`dropdown-item${styles.textDecoration === 'underline' ? ' active' : ''}`}
              onClick={() => toggleStyleProp('textDecoration', 'underline', 'none')}
              type="button"
              aria-label="Toggle underline"
            >
              <span className="dropdown-icon" aria-hidden="true">𝑼</span>
            </button>
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      <div className="floating-toolbar__dropdown" ref={alignDropdownRef}>
        <button
          className={`dropdown-trigger${alignMenuOpen ? ' open' : ''}`}
          onClick={() => {
            setAlignMenuOpen(prev => !prev);
            setStyleMenuOpen(false);
          }}
          type="button"
          title="Text alignment"
          aria-label={`Text alignment (${currentAlign})`}
        >
          <span className="align-icon" aria-hidden="true">{renderAlignIcon(currentAlign)}</span>
          <span className="dropdown-caret">▾</span>
        </button>
        {alignMenuOpen && (
          <div className="floating-toolbar__menu">
            {['left', 'center', 'right'].map(option => (
              <button
                key={option}
                className={`dropdown-item${currentAlign === option ? ' active' : ''}`}
                onClick={() => {
                  onStyleChange('textAlign', option);
                  setAlignMenuOpen(false);
                }}
                type="button"
                aria-label={`Align ${option}`}
              >
                <span className="align-icon" aria-hidden="true">{renderAlignIcon(option)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="floating-toolbar__dropdown" ref={spacingDropdownRef}>
        <button
          className={`dropdown-trigger${spacingMenuOpen ? ' open' : ''}`}
          onClick={() => {
            setSpacingMenuOpen(prev => !prev);
            setStyleMenuOpen(false);
            setAlignMenuOpen(false);
          }}
          type="button"
          title="Line spacing"
          aria-label={`Line spacing (${(styles.lineHeight || 1.2)}x)`}
        >
          <span className="dropdown-icon spacing-icon" aria-hidden="true">
            {renderSpacingIcon()}
            <span className="dropdown-caret">▾</span>
          </span>
        </button>
        {spacingMenuOpen && (
          <div className="floating-toolbar__menu floating-toolbar__menu--wide">
            {spacingOptions.map(option => (
              <button
                key={option}
                className={`dropdown-item dropdown-item--wide${(styles.lineHeight || 1.2) === option ? ' active' : ''}`}
                onClick={() => {
                  onStyleChange('lineHeight', option);
                  setSpacingMenuOpen(false);
                }}
                type="button"
                aria-label={`Set line spacing to ${option}x`}
              >
                <span aria-hidden="true">{option}x</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className={styles.listStyle === 'bullet' ? 'active' : ''}
        onClick={() => onApplyListStyle('bullet')}
        title="Bullet list"
      >
        •
      </button>
      <button
        className={styles.listStyle === 'number' ? 'active' : ''}
        onClick={() => onApplyListStyle('number')}
        title="Numbered list"
      >
        1.
      </button>

      <div className="toolbar-divider" />

      <ColorIconPicker
        title="Font color"
        ariaLabel="Font color"
        icon={(
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4.4 11.2L6.3 5.2C6.6 4.3 7.3 3.8 8 3.8C8.7 3.8 9.4 4.3 9.7 5.2L11.6 11.2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.4 8.9H10.6"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <rect
              x="3.4"
              y="12.2"
              width="9.2"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
          </svg>
        )}
        value={styles.color}
        fallback="#111111"
        onChange={(color) => onStyleChange('color', color)}
        onReset={() => onStyleChange('color', null)}
      />

      <ColorIconPicker
        title="Text fill color"
        ariaLabel="Text fill color"
        icon={(
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1.8" y="2" width="12.4" height="9.6" rx="1.6" fill="currentColor" stroke="currentColor" opacity="0.2" />
            <path d="M2 12.2h12" stroke="currentColor" strokeLinecap="round" />
          </svg>
        )}
        value={styles.backgroundColor}
        fallback="#ffffff"
        onChange={(color) => onStyleChange('backgroundColor', color)}
        onReset={() => onStyleChange('backgroundColor', null)}
      />

      <ColorIconPicker
        title="Text outline color"
        ariaLabel="Text outline color"
        icon={(
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M8 2.4L12.8 6.8C13.9 7.9 13.9 9.7 12.8 10.8L8 15.2 3.2 10.8C2.1 9.7 2.1 7.9 3.2 6.8L8 2.4Z" fill="currentColor" opacity="0.2" />
            <path d="M8 3.6L11.6 7C12.3 7.7 12.3 8.8 11.6 9.5L8 12.9 4.4 9.5C3.7 8.8 3.7 7.7 4.4 7L8 3.6Z" />
          </svg>
        )}
        value={styles.borderColor}
        fallback="#000000"
        onChange={(color) => onStyleChange('borderColor', color)}
        onReset={() => onStyleChange('borderColor', null)}
      />

      <div className="toolbar-number-control" title="Border width">
        <span className="toolbar-number-control__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2.2" y="3.2" width="11.6" height="9.6" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
            <rect x="4.4" y="5.4" width="7.2" height="5.2" rx="1.6" fill="currentColor" opacity="0.15" />
            <path d="M12.6 4.6L12.6 11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M3.4 4.6L3.4 11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="number"
          className="toolbar-number-control__input"
          min={0}
          max={12}
          step={0.5}
          value={Number.isFinite(styles.borderWidth) ? styles.borderWidth : 0}
          onChange={(e) => {
            const nextValue = parseFloat(e.target.value);
            onStyleChange('borderWidth', Number.isFinite(nextValue) ? nextValue : 0);
          }}
          aria-label="Border width"
        />
      </div>

      <div className="toolbar-divider" />

      <button className="delete-btn" onClick={onDelete} title="Delete text" aria-label="Delete text">
        <span aria-hidden="true">🗑</span>
      </button>
    </div>
  );
}

// Floating Shape/Chart Toolbar Component
function FloatingShapeToolbar({ element, onChangeProp, onEditChart, onDelete }) {
  const toolbarRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!element) return;

    const updatePosition = () => {
      const canvas = document.querySelector('.canvas');
      if (!toolbarRef.current || !canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      const scale = canvasRect.width / CANVAS_BASE_WIDTH;

      const elementX = (element.x || 0) * scale + canvasRect.left;
      const elementY = (element.y || 0) * scale + canvasRect.top;
      const elementWidth = (element.w || 0) * scale;
      const elementHeight = (element.h || 0) * scale;

      const gap = 12;
      const canvasTopPadding = canvasRect.top + 8;
      const canvasBottomLimit = canvasRect.bottom - toolbarRect.height - 8;

      const topCandidate = elementY - toolbarRect.height - gap;
      const bottomCandidate = elementY + elementHeight + gap;
      const top = topCandidate >= canvasTopPadding
        ? Math.min(topCandidate, canvasBottomLimit)
        : Math.min(Math.max(bottomCandidate, canvasTopPadding), canvasBottomLimit);

      const elementCenterX = elementX + elementWidth / 2;
      let left = elementCenterX - toolbarRect.width / 2;
      left = Math.max(canvasRect.left + 8, Math.min(left, canvasRect.right - toolbarRect.width - 8));

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [element?.id, element?.x, element?.y, element?.w, element?.h]);

  if (!element) return null;
  const isChart = element.type === 'chart';
  const isImage = element.type === 'image';

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar floating-toolbar--shape"
      style={{ top: position.top, left: position.left }}
    >
      {!isImage && !isChart && (
        <ColorIconPicker
          title="Shape fill color"
          ariaLabel="Shape fill color"
          icon={(
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 2.2c-0.18 0-0.35 0.07-0.48 0.2L5.22 4.99c-0.97 1.04-1.51 2.22-1.51 3.52 0 2.14 1.67 3.89 4.29 3.89s4.29-1.75 4.29-3.89c0-1.3-0.54-2.48-1.51-3.52L8.48 2.4C8.35 2.27 8.18 2.2 8 2.2Z"
                fill="currentColor"
                opacity="0.22"
              />
              <path
                d="M8 2.2c-0.18 0-0.35 0.07-0.48 0.2L5.22 4.99c-0.97 1.04-1.51 2.22-1.51 3.52 0 2.14 1.67 3.89 4.29 3.89s4.29-1.75 4.29-3.89c0-1.3-0.54-2.48-1.51-3.52L8.48 2.4C8.35 2.27 8.18 2.2 8 2.2Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.6 7.6c0.9 0.3 1.65 0.45 2.4 0.45s1.5-0.15 2.4-0.45"
                stroke="currentColor"
                strokeWidth="1.05"
                strokeLinecap="round"
              />
            </svg>
          )}
          value={element.fill}
          fallback="#4e79a7"
          onChange={(color) => onChangeProp('fill', color)}
          onReset={() => onChangeProp('fill', null)}
        />
      )}
      {!isImage && !isChart && (
        <ColorIconPicker
          title="Shape border color"
          ariaLabel="Shape border color"
          icon={(
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="2.4"
                y="3.2"
                width="11.2"
                height="9.6"
                rx="2.2"
                stroke="currentColor"
                strokeWidth="1.25"
              />
              <rect
                x="4.6"
                y="5.4"
                width="6.8"
                height="5.2"
                rx="1.6"
                stroke="currentColor"
                strokeWidth="1.05"
                opacity="0.4"
              />
            </svg>
          )}
          value={element.stroke}
          fallback="#000000"
          onChange={(color) => onChangeProp('stroke', color)}
          onReset={() => onChangeProp('stroke', null)}
        />
      )}
      {!isChart && !isImage && (
        <input
          type="number"
          min={0}
          max={20}
          value={element.strokeWidth || 2}
          onChange={(e) => onChangeProp('strokeWidth', parseInt(e.target.value || '2', 10))}
          title="Border width"
        />
      )}

      {isChart && (
        <>
          <div className="toolbar-divider" />
          <button onClick={onEditChart} title="Edit chart data">
            Edit Data
          </button>
        </>
      )}

      <div className="toolbar-divider" />

      <button className="delete-btn" onClick={onDelete} title="Delete element" aria-label="Delete element">
        <span aria-hidden="true">🗑</span>
      </button>
    </div>
  );
}

const CANVAS_BASE_WIDTH = 960;
const CANVAS_BASE_HEIGHT = 520;
const PRESENTATION_FRAME_PADDING = 64;
const PX_PER_INCH = 96;
const AUTOPLAY_INTERVAL_MS = 5000;
const MIN_CANVAS_ZOOM = 0.5;
const MAX_CANVAS_ZOOM = 2;
const CANVAS_ZOOM_STEP = 0.1;

function parseDimension(value, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (value == null) return fallback;
  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : fallback;
}

function clampElementToCanvas(element) {
  if (!element) return;

  const width = Math.max(0, parseDimension(element.w, 0));
  const height = Math.max(0, parseDimension(element.h, 0));
  const limitedWidth = Math.min(width, CANVAS_BASE_WIDTH);
  const limitedHeight = Math.min(height, CANVAS_BASE_HEIGHT);

  let currentX = parseDimension(element.x, 0);
  let currentY = parseDimension(element.y, 0);

  if (!Number.isFinite(currentX)) currentX = 0;
  if (!Number.isFinite(currentY)) currentY = 0;

  const maxX = Math.max(0, CANVAS_BASE_WIDTH - limitedWidth);
  const maxY = Math.max(0, CANVAS_BASE_HEIGHT - limitedHeight);

  element.x = Math.min(Math.max(0, currentX), maxX);
  element.y = Math.min(Math.max(0, currentY), maxY);
}

function clampResizeToCanvas({ x, y, w, h, dir }) {
  let nextX = parseDimension(x, 0);
  let nextY = parseDimension(y, 0);
  let nextW = Math.max(20, parseDimension(w, 0));
  let nextH = Math.max(20, parseDimension(h, 0));

  if (nextX < 0) {
    if (dir && dir.includes('w')) {
      nextW = Math.max(20, nextW + nextX);
    }
    nextX = 0;
  }
  if (nextY < 0) {
    if (dir && dir.includes('n')) {
      nextH = Math.max(20, nextH + nextY);
    }
    nextY = 0;
  }

  const maxRight = CANVAS_BASE_WIDTH;
  const maxBottom = CANVAS_BASE_HEIGHT;

  if (nextX + nextW > maxRight) {
    const overflow = nextX + nextW - maxRight;
    if (dir && dir.includes('e')) {
      nextW = Math.max(20, nextW - overflow);
    } else {
      nextX = Math.max(0, nextX - overflow);
    }
  }

  if (nextY + nextH > maxBottom) {
    const overflow = nextY + nextH - maxBottom;
    if (dir && dir.includes('s')) {
      nextH = Math.max(20, nextH - overflow);
    } else {
      nextY = Math.max(0, nextY - overflow);
    }
  }

  nextW = Math.min(Math.max(20, nextW), CANVAS_BASE_WIDTH);
  nextH = Math.min(Math.max(20, nextH), CANVAS_BASE_HEIGHT);
  nextX = Math.min(Math.max(0, nextX), CANVAS_BASE_WIDTH - nextW);
  nextY = Math.min(Math.max(0, nextY), CANVAS_BASE_HEIGHT - nextH);

  return { x: nextX, y: nextY, w: nextW, h: nextH };
}

const DEFAULT_CHART_COLORS = ['#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ab'];

function pxToIn(px) {
  return Number((px / PX_PER_INCH).toFixed(4));
}

function normalizeColor(color, fallback = '#4e79a7') {
  const toHex = (num) => {
    const clamped = Math.max(0, Math.min(255, Number(num)));
    const hex = Number.isFinite(clamped) ? Math.round(clamped).toString(16).padStart(2, '0') : '00';
    return hex.toUpperCase();
  };

  const parse = (value) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const varMatch = trimmed.match(/^var\((.+)\)$/);
    if (varMatch && typeof document !== 'undefined' && document?.documentElement) {
      const parts = varMatch[1].split(',');
      const varName = parts[0]?.trim();
      const fallbackValue = parts.slice(1).join(',').trim();
      try {
        if (varName) {
          const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          if (computed && computed !== trimmed) {
            const parsedComputed = parse(computed);
            if (parsedComputed) return parsedComputed;
          }
        }
      } catch (err) {
        console.warn('Failed to resolve CSS variable color:', trimmed, err);
      }
      if (fallbackValue && fallbackValue !== trimmed) {
        const parsedFallback = parse(fallbackValue);
        if (parsedFallback) return parsedFallback;
      }
    }

    if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
      const [, shortHex] = trimmed.match(/^#([0-9a-fA-F]{3})$/);
      return shortHex.split('').map((ch) => ch + ch).join('').toUpperCase();
    }

    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
      return trimmed.slice(1, 7).toUpperCase();
    }

    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    if (/^[0-9a-fA-F]{8}$/.test(trimmed)) {
      return trimmed.slice(0, 6).toUpperCase();
    }

    const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
    if (rgbMatch) {
      const channels = rgbMatch[1]
        .split(',')
        .map((part) => part.trim())
        .slice(0, 3);
      if (channels.length === 3) {
        return channels.map((ch) => {
          if (ch.endsWith('%')) {
            return toHex((parseFloat(ch) || 0) * 2.55);
          }
          return toHex(ch);
        }).join('');
      }
    }

    if (typeof document !== 'undefined') {
      try {
        if (!normalizeColor._colorParserCanvas) {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          normalizeColor._colorParserCanvas = canvas.getContext('2d');
        }
        const ctx = normalizeColor._colorParserCanvas;
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillStyle = trimmed;
          const computed = ctx.fillStyle;
          if (computed && computed !== '#000000') {
            return parse(computed);
          }
        }
      } catch (err) {
        console.warn('Color parser failed for value:', trimmed, err);
      }
    }

    return null;
  };

  return parse(color) || parse(fallback) || '4E79A7';
}

function sanitizeHexColor(value) {
  if (typeof value !== 'string') return null;
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toUpperCase();
  }
  return null;
}

function hexToRgb(hex) {
  const sanitized = sanitizeHexColor(hex);
  if (!sanitized) return null;
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16)
  };
}

function rgbaFromHex(hex, alpha = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

function blendWithWhite(hex, factor = 0.2, alpha = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const amount = Math.max(0, Math.min(1, factor));
  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

function getReadableTextColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#1f2937';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? '#111827' : '#f8fafc';
}

function prepareImageOptions(el) {
  if (!el?.src) return null;
  const base = {
    x: pxToIn(el.x || 0),
    y: pxToIn(el.y || 0),
    w: pxToIn(el.w || PX_PER_INCH),
    h: pxToIn(el.h || PX_PER_INCH),
  };
  if (el.src.startsWith('data:')) {
    const match = el.src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/i);
    if (match) {
      const format = match[1].split('/')[1];
      if (format) {
        base.extension = format.toLowerCase();
      }
      base.contentType = match[1];
      base.data = el.src; // keep full data URI for PptxGenJS compatibility
      base.data64 = match[2];
    } else {
      base.data = el.src;
    }
  } else {
    base.path = el.src;
  }
  return base;
}

function buildBarLineChart(slide, pptx, el, labels, datasets) {
  if (!datasets.length) return;
  const chartData = datasets.map((ds, idx) => ({
    name: ds.label || `Series ${idx + 1}`,
    labels,
    values: (ds.values || []).map(v => Number(v) || 0),
  }));
  const chartColors = datasets.map((ds, idx) =>
    normalizeColor(ds.color || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length])
  );
  const chartType = el.chartType === 'line' ? pptx.ChartType.line : pptx.ChartType.bar;
  slide.addChart(chartType, chartData, {
    x: pxToIn(el.x || 0),
    y: pxToIn(el.y || 0),
    w: pxToIn(el.w || PX_PER_INCH * 5),
    h: pxToIn(el.h || PX_PER_INCH * 3),
    chartColors,
    showLegend: datasets.length > 1,
  });
}

function buildPieChart(slide, pptx, el, labels, datasets) {
  if (!datasets.length) return;
  const [dataset] = datasets;
  const values = (dataset.values || []).map(v => Number(v) || 0);
  const resolvedLabels = labels.length
    ? labels
    : values.map((_, idx) => `Item ${idx + 1}`);

  const palette = Array.isArray(dataset.segmentColors) && dataset.segmentColors.length
    ? dataset.segmentColors
    : Array.isArray(dataset.colors) && dataset.colors.length
      ? dataset.colors
      : dataset.color
        ? [dataset.color]
        : DEFAULT_CHART_COLORS;

  const chartColors = resolvedLabels.map((_, idx) => {
    const hex = normalizeColor(palette[idx % palette.length]);
    return hex.startsWith('#') ? hex : `#${hex}`;
  });

  const data = [{
    name: dataset.label || 'Series 1',
    labels: resolvedLabels,
    values,
  }];

  slide.addChart(pptx.ChartType.pie, data, {
    x: pxToIn(el.x || 0),
    y: pxToIn(el.y || 0),
    w: pxToIn(el.w || PX_PER_INCH * 4),
    h: pxToIn(el.h || PX_PER_INCH * 4),
    chartColors,
    showLegend: resolvedLabels.length > 0,
  });
}

function getMinTextHeight(styles) {
  const fontSize = Number(styles?.fontSize) || 18;
  const lineHeight = Number(styles?.lineHeight) || 1.2;
  const baseline = fontSize * lineHeight;
  return Math.max(40, Math.ceil(baseline + 16));
}

function measureTextareaHeight(textarea, styles) {
  if (!textarea) {
    return getMinTextHeight(styles);
  }
  const previousHeight = textarea.style.height;
  textarea.style.height = 'auto';
  const measured = textarea.scrollHeight;
  textarea.style.height = previousHeight || '100%';
  return Math.max(getMinTextHeight(styles), Math.ceil(measured));
}

let hiddenMeasurementTextarea = null;

function getMeasurementTextarea() {
  if (typeof document === 'undefined') {
    return null;
  }
  if (!hiddenMeasurementTextarea) {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'absolute';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.visibility = 'hidden';
    textarea.style.pointerEvents = 'none';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.wordWrap = 'break-word';
    textarea.style.overflow = 'hidden';
    textarea.style.boxSizing = 'border-box';
    textarea.style.padding = '8px 12px';
    textarea.style.border = '1px solid transparent';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    hiddenMeasurementTextarea = textarea;
  }
  return hiddenMeasurementTextarea;
}

function measureTextHeightForWidth(content, styles, width) {
  const minHeight = getMinTextHeight(styles);
  const textarea = getMeasurementTextarea();
  if (!textarea) {
    return minHeight;
  }

  const effectiveWidth = Math.max(20, Number(width) || 0);
  textarea.style.width = `${effectiveWidth}px`;
  textarea.style.fontSize = `${styles?.fontSize || 18}px`;
  textarea.style.fontFamily = styles?.fontFamily || 'Arial';
  textarea.style.fontWeight = styles?.fontWeight === 'bold' ? 'bold' : 'normal';
  textarea.style.fontStyle = styles?.fontStyle === 'italic' ? 'italic' : 'normal';
  textarea.style.lineHeight = typeof styles?.lineHeight === 'number'
    ? `${styles.lineHeight}`
    : (styles?.lineHeight || '1.2');
  textarea.value = content || '';
  textarea.style.height = 'auto';

  const measured = textarea.scrollHeight;
  return Math.max(minHeight, Math.ceil(measured));
}

function Canvas({ slide, selectedElementId, draggingElementId, onSelect, onChangeText, onDragStart, onResizeStart, isPresenting = false, zoom = 1 }) {
  const wrapperRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);
  const safeZoom = Number.isFinite(zoom) ? zoom : 1;
  const effectiveScale = Math.min(Math.max(fitScale * safeZoom, 0.25), 3);
  const textareaRefs = useRef({});

  const handleTextKeyDown = (event, element) => {
    if (event.key === 'Enter') {
      // Handle Enter key - auto-expand height and handle list formatting
      event.preventDefault();
      const target = event.target;
      const textareaNode = textareaRefs.current[element.id] || target;
      let updatedValue = '';
      let newCursorPos = 0;

      if (element.content === 'Click to edit text') {
        updatedValue = '\n';
        newCursorPos = 1;
      } else {
        const value = target.value;
        const selectionStart = target.selectionStart ?? value.length;
        const selectionEnd = target.selectionEnd ?? value.length;
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        const lineStart = before.lastIndexOf('\n') + 1;
        const currentLine = before.slice(lineStart);

        const listStyle = element.styles?.listStyle || 'none';
        let insert = '\n';
        if (listStyle === 'bullet') {
          insert += '• ';
        } else if (listStyle === 'number') {
          const match = currentLine.match(/^(\d+)[\.)]\s*/);
          const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
          insert += `${nextNumber}. `;
        }

        updatedValue = before + insert + after;
        newCursorPos = before.length + insert.length;
      }

      if (textareaNode) {
        textareaNode.value = updatedValue;
      }
      const newHeight = measureTextareaHeight(textareaNode, element.styles);
      if (typeof onChangeText === 'function') {
        onChangeText(element.id, updatedValue, newHeight);
      }

      setTimeout(() => {
        const node = textareaRefs.current[element.id];
        if (node) {
          node.selectionStart = node.selectionEnd = newCursorPos;
        }
      }, 0);
    } else if (event.key === 'Backspace') {
      // Handle Backspace - auto-shrink height when lines are deleted
      const target = event.target;
      const value = target.value;
      const selectionStart = target.selectionStart ?? value.length;

      // If this is default text and user is trying to delete, replace with empty
      if (value === 'Click to edit text' && selectionStart > 0) {
        const textareaNode = textareaRefs.current[element.id] || target;
        if (textareaNode) {
          textareaNode.value = '';
        }
        const newHeight = measureTextareaHeight(textareaNode, element.styles);
        if (typeof onChangeText === 'function') {
          onChangeText(element.id, '', newHeight);
        }
        return;
      }

      // Only auto-resize if we're at the beginning of a line or deleting the last character
      if (selectionStart === 0 || (selectionStart === 1 && value.length === 1)) {
        return; // Don't interfere with normal backspace behavior
      }

      // Let the default backspace happen first
      setTimeout(() => {
        const textareaNode = textareaRefs.current[element.id] || target;
        const newValue = textareaNode ? textareaNode.value : target.value;
        if (newValue !== value) {
          const newHeight = measureTextareaHeight(textareaNode, element.styles);
          if (typeof onChangeText === 'function') {
            onChangeText(element.id, newValue, newHeight);
          }
        }
      }, 0);
    }
  };

  useEffect(() => {
    const updateScale = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const { clientWidth, clientHeight } = wrapper;
      if (!clientWidth || !clientHeight) return;
      const widthScale = clientWidth / CANVAS_BASE_WIDTH;
      const heightScale = clientHeight / CANVAS_BASE_HEIGHT;
      const fitted = Math.min(widthScale, heightScale, 1);
      const nextScale = Math.max(fitted, 0.1);
      setFitScale(nextScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScale);
      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
      }
    }
    return () => {
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const viewportStyle = {
    width: CANVAS_BASE_WIDTH,
    height: CANVAS_BASE_HEIGHT,
    transform: `scale(${effectiveScale})`,
    transformOrigin: 'center center',
  };

  const canvasStyle = {
    background: slide.background,
    width: CANVAS_BASE_WIDTH,
    height: CANVAS_BASE_HEIGHT,
  };

  const handleElementPointerDown = useCallback((event, element) => {
    if (isPresenting) return;
    if (!onDragStart) return;
    if (event.button !== 0) return;
    if (event.target && (event.target.tagName === 'TEXTAREA' || event.target.closest('textarea'))) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (typeof onSelect === 'function') {
      onSelect(element.id);
    }
    onDragStart(element.id, event, effectiveScale);
  }, [isPresenting, onDragStart, onSelect, effectiveScale]);

  const handleCanvasPointerDown = useCallback((event) => {
    if (isPresenting) return;
    if (event.target !== event.currentTarget) return;
    event.stopPropagation();
    if (typeof onSelect === 'function') {
      onSelect(null);
    }
  }, [isPresenting, onSelect]);

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <div className="canvas-viewport" style={viewportStyle}>
        <div className="canvas" style={canvasStyle} onPointerDown={handleCanvasPointerDown}>
          {slide.elements.map(el => {
          const isDragging = draggingElementId === el.id;
          const style = {
            left: el.x,
            top: el.y,
            width: el.w,
            height: el.h,
            transform: `rotate(${el.rotation || 0}deg)`
          };
          const selected = el.id === selectedElementId;
          const baseClasses = ['el', `${el.type}-el`];
          if (selected) baseClasses.push('selected');
          if (isDragging) baseClasses.push('is-dragging');

          const commonProps = {
            onPointerDown: (event) => {
              handleElementPointerDown(event, el);
            },
            onClick: (e) => {
              if (isPresenting) return;
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                onSelect(el.id);
              }
            },
            className: baseClasses.join(' '),
          };

          if (el.type === 'text') {
            const textBackground = el.styles?.backgroundColor || 'transparent';
            const hasBorderColor = Boolean(el.styles?.borderColor);
            const textBorderColor = el.styles?.borderColor || 'transparent';
            const borderWidthValue = Number.isFinite(el.styles?.borderWidth) ? Math.max(0, el.styles.borderWidth) : (hasBorderColor ? 1.5 : 0);
            const rawPlaceholder = typeof el.placeholder === 'string' && el.placeholder.trim()
              ? el.placeholder
              : null;
            const placeholderText = (() => {
              if (!rawPlaceholder) return '';
              if (rawPlaceholder === DEFAULT_TEXT_PLACEHOLDERS.bullet) return 'Add bullet points';
              return rawPlaceholder;
            })();
            const isPlaceholderActive = !isPresenting && !el.content && Boolean(placeholderText);
            return (
              <div
                key={el.id}
                id={`element-${el.id}`}
                style={style}
                {...commonProps}
              >
                <textarea
                  readOnly={isPresenting}
                  value={el.content}
                  placeholder={!isPresenting && placeholderText ? placeholderText : undefined}
                  ref={(node) => {
                    if (node) {
                      textareaRefs.current[el.id] = node;
                    } else {
                      delete textareaRefs.current[el.id];
                    }
                  }}
                  className={isPlaceholderActive ? 'text-el-input text-el-input--placeholder' : 'text-el-input'}
                  onChange={e => {
                    const value = e.target.value;
                    const textareaNode = textareaRefs.current[el.id] || e.target;
                    const newHeight = measureTextareaHeight(textareaNode, el.styles);
                    onChangeText(el.id, value, newHeight);
                  }}
                  onKeyDown={(e) => handleTextKeyDown(e, el)}
                  onMouseDown={(e) => {
                    if (isPresenting) {
                      e.preventDefault();
                      return;
                    }
                    e.stopPropagation();
                    // Ensure the textarea gets focus when clicked
                    e.target.focus();
                  }}
                  onClick={(e) => {
                    if (isPresenting) return;
                    e.stopPropagation();
                    // Select the text element if it's not already selected
                    if (!selected) {
                      onSelect(el.id);
                    }
                    // Ensure the textarea gets focus when clicked
                    e.target.focus();
                  }}
                  onFocus={(e) => {
                    if (isPresenting) {
                      e.preventDefault();
                      e.target.blur();
                      return;
                    }
                    e.stopPropagation();
                    // Ensure the text element is selected when the textarea gets focus
                    if (!selected) {
                      onSelect(el.id);
                    }
                  }}
                  style={{
                    fontSize: el.styles?.fontSize || 18,
                    color: el.styles?.color || '#111111',
                    fontWeight: el.styles?.fontWeight,
                    fontStyle: el.styles?.fontStyle,
                    textDecoration: el.styles?.textDecoration,
                    textAlign: el.styles?.textAlign,
                    fontFamily: el.styles?.fontFamily || 'Arial',
                    lineHeight: el.styles?.lineHeight || 1.2,
                    backgroundColor: textBackground,
                    backgroundClip: 'padding-box',
                    border: hasBorderColor && borderWidthValue > 0 ? `${borderWidthValue}px solid ${textBorderColor}` : `${borderWidthValue || 1}px solid transparent`,
                    borderRadius: 12,
                    boxShadow: hasBorderColor ? '0 0 0 1px rgba(15, 23, 42, 0.06)' : 'none',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease',
                  }}
                />
                {selected && !isPresenting && (
                  <ResizeHandles onResizeStart={(dir, evt, s) => onResizeStart(el.id, dir, evt, s)} scale={effectiveScale} />
                )}
              </div>
            );
          }
          if (el.type === 'image') {
            return (
              <div
                key={el.id}
                id={`element-${el.id}`}
                style={style}
                {...commonProps}
              >
                <img src={el.src} alt="" draggable={false} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                {selected && !isPresenting && (
                  <ResizeHandles onResizeStart={(dir, evt, s) => onResizeStart(el.id, dir, evt, s)} scale={effectiveScale} />
                )}
              </div>
            );
          }
          if (el.type === 'chart') {
            return (
              <div
                key={el.id}
                id={`element-${el.id}`}
                style={style}
                {...commonProps}
              >
                <ChartElement element={el} scale={1} />
                {selected && !isPresenting && (
                  <ResizeHandles onResizeStart={(dir, evt, s) => onResizeStart(el.id, dir, evt, s)} scale={effectiveScale} />
                )}
              </div>
            );
          }
          if (el.type === 'shape') {
            return (
              <div
                key={el.id}
                style={style}
                {...commonProps}
              >
                <ShapeElement element={el} scale={1} />
                {selected && !isPresenting && (
                  <ResizeHandles onResizeStart={(dir, evt, s) => onResizeStart(el.id, dir, evt, s)} scale={effectiveScale} />
                )}
              </div>
            );
          }
            return null;
          })}
          <div
            className="canvas-overlay"
            onClick={isPresenting ? undefined : () => onSelect(null)}
          />
        </div>
      </div>
    </div>
  );
}


function ResizeHandles({ onResizeStart, scale }) {
  const bind = (dir) => (evt) => onResizeStart(dir, evt, scale);
  return (
    <>
      <div className="resize-handle nw" onPointerDown={bind('nw')} onMouseDown={bind('nw')} />
      <div className="resize-handle ne" onPointerDown={bind('ne')} onMouseDown={bind('ne')} />
      <div className="resize-handle sw" onPointerDown={bind('sw')} onMouseDown={bind('sw')} />
      <div className="resize-handle se" onPointerDown={bind('se')} onMouseDown={bind('se')} />
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
              name: data.name || '📄 Untitled',
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
  }, [onClose, onLoadId]);

  const handleDelete = useCallback(async (id) => {
    try {
      localStorage.removeItem(`presentation_${id}`);
    } catch (err) {
      console.warn('Failed to remove local presentation cache', err);
    }

    setItems(prev => prev.filter(item => item.id !== id));

    try {
      const response = await fetch(`/api/presentations/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to delete presentation from server', err);
      alert('Unable to delete the presentation on the server. Please refresh and try again.');
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
                    <div className="name">{it.name || '📄 Untitled'}</div>
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
                          handleDelete(it.id);
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
  if (!element) return null;

  const [chartType, setChartType] = useState(element.chartType || 'bar');
  const [labels, setLabels] = useState((element.data?.labels || ['A', 'B', 'C']).join(','));
  const [datasets, setDatasets] = useState(() =>
    (element.data?.datasets || [{ label: 'Series 1', values: [3, 5, 2], color: '#4e79a7' }]).map((ds) => ({
      ...ds,
      segmentColors: Array.isArray(ds.segmentColors) ? [...ds.segmentColors] : [],
    }))
  );

  const labelList = useMemo(
    () => labels.split(',').map((s) => s.trim()).filter(Boolean),
    [labels]
  );

  const ensureLengths = useCallback(
    (inputDatasets, nextChartType = chartType, nextLabels = labelList) => {
      if (nextChartType !== 'pie') return inputDatasets;
      return inputDatasets.map((ds) => {
        const next = { ...ds };
        const desired = nextLabels.length;
        next.segmentColors = Array.isArray(next.segmentColors) ? [...next.segmentColors] : [];
        if (next.segmentColors.length !== desired) {
          const palette = next.segmentColors.concat(DEFAULT_CHART_COLORS);
          next.segmentColors = Array.from({ length: desired }, (_, idx) => palette[idx] || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]);
        }
        if (!Array.isArray(next.values)) {
          next.values = Array(desired).fill(0);
        } else if (next.values.length !== desired) {
          next.values = Array.from({ length: desired }, (_, idx) => next.values[idx] ?? 0);
        }
        return next;
      });
    },
    [chartType, labelList]
  );

  useEffect(() => {
    setDatasets((prev) => ensureLengths(prev, chartType, labelList));
  }, [chartType, labelList, ensureLengths]);

  const handleLabelsChange = (value) => {
    setLabels(value);
    const nextLabels = value.split(',').map((s) => s.trim()).filter(Boolean);
    setDatasets((prev) =>
      ensureLengths(
        prev.map((ds) => {
          const next = { ...ds };
          const desired = nextLabels.length;
          if (Array.isArray(next.values)) {
            next.values = Array.from({ length: desired }, (_, idx) => next.values[idx] ?? 0);
          } else {
            next.values = Array(desired).fill(0);
          }
          return next;
        }),
        chartType,
        nextLabels
      )
    );
  };

  function addDataset() {
    setDatasets((prev) =>
      ensureLengths([
        ...prev,
        {
          label: `Series ${prev.length + 1}`,
          values: labelList.map(() => 0),
          color: '#f28e2c',
          segmentColors: labelList.map((_, idx) => DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]),
        },
      ])
    );
  }

  function removeDataset(idx) {
    setDatasets((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateDataset(idx, field, value) {
    setDatasets((prev) => {
      const next = [...prev];
      if (!next[idx]) return prev;

      if (field === 'values') {
        const values = value
          .split(',')
          .map((s) => {
            const num = parseFloat(s.trim());
            return Number.isFinite(num) ? num : 0;
          });
        next[idx] = { ...next[idx], values };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }

      return ensureLengths(next);
    });
  }

  function updateSegmentColor(datasetIndex, segmentIndex, color) {
    setDatasets((prev) => {
      const next = prev.map((ds, idx) => {
        if (idx !== datasetIndex) return ds;
        const segmentColors = Array.isArray(ds.segmentColors) ? [...ds.segmentColors] : [];
        segmentColors[segmentIndex] = color;
        return { ...ds, segmentColors };
      });
      return ensureLengths(next);
    });
  }

  const handleSave = () => {
    const lbls = labels.split(',').map((s) => s.trim()).filter(Boolean);
    const sanitized = datasets.map((ds) => {
      const next = { ...ds };
      if (chartType === 'pie') {
        next.segmentColors = Array.isArray(next.segmentColors)
          ? next.segmentColors.slice(0, lbls.length)
          : [];
        while (next.segmentColors.length < lbls.length) {
          next.segmentColors.push(DEFAULT_CHART_COLORS[next.segmentColors.length % DEFAULT_CHART_COLORS.length]);
        }
      } else {
        delete next.segmentColors;
        if (!next.color) {
          next.color = '#4e79a7';
        }
      }
      return next;
    });
    onUpdate({ chartType, data: { labels: lbls, datasets: sanitized } });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-body chart-editor">
        <h3>Edit Chart</h3>
        <label>Chart Type</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
        <label>Labels (comma-separated)</label>
        <input
          value={labels}
          onChange={(e) => handleLabelsChange(e.target.value)}
          placeholder="e.g., Q1, Q2, Q3, Q4"
        />
        <h4>Data Series</h4>
        {datasets.map((ds, datasetIndex) => {
          const baseLabels = labelList.length
            ? labelList
            : (ds.values || []).map((_, idx) => `Slice ${idx + 1}`);
          const segmentLabels = baseLabels.map((label, idx) => label || `Slice ${idx + 1}`);
          return (
            <div key={datasetIndex} className="dataset-row">
              <input
                placeholder="Label"
                value={ds.label}
                onChange={(e) => updateDataset(datasetIndex, 'label', e.target.value)}
              />
              <input
                placeholder="Values (comma-sep)"
                value={(ds.values || []).join(',')}
                onChange={(e) => updateDataset(datasetIndex, 'values', e.target.value)}
              />
              {chartType === 'pie' ? (
                <div className="segment-colors">
                  {segmentLabels.map((label, segmentIndex) => (
                    <label key={segmentIndex} className="segment-color-field">
                      <span>{label || `Slice ${segmentIndex + 1}`}</span>
                      <input
                        type="color"
                        value={
                          ds.segmentColors?.[segmentIndex] ||
                          DEFAULT_CHART_COLORS[segmentIndex % DEFAULT_CHART_COLORS.length]
                        }
                        onChange={(e) => updateSegmentColor(datasetIndex, segmentIndex, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="color"
                  value={ds.color || '#4e79a7'}
                  onChange={(e) => updateDataset(datasetIndex, 'color', e.target.value)}
                />
              )}
              <button onClick={() => removeDataset(datasetIndex)}>✕</button>
            </div>
          );
        })}
        <button onClick={addDataset}>+ Add Series</button>
        <div className="actions">
          <button onClick={handleSave}>Save</button>
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
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [draggingSlideIndex, setDraggingSlideIndex] = useState(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const stageRef = useRef(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  
  const selectedSlide = presentation.slides[currentSlide];
  const selectedElement = selectedSlide?.elements.find(e=>e.id===selectedElementId) || null;
  const currentTheme = resolveTheme(presentation.selectedThemeId);

  const handleAddSlideWithLayout = useCallback((layoutId) => {
    const themeId = presentation.selectedThemeId || DEFAULT_THEME.id;
    const newSlide = makeSlide(layoutId, themeId);
    setPresentation(prev => {
      const newSlides = [...prev.slides];
      newSlides.splice(currentSlide + 1, 0, newSlide);
      return { ...prev, slides: newSlides };
    });
    setCurrentSlide(currentSlide + 1);
    setShowLayouts(false);
    
    // Update history
    const newState = {
      ...presentation,
      slides: [...presentation.slides.slice(0, currentSlide + 1), newSlide, ...presentation.slides.slice(currentSlide + 1)]
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newState));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [currentSlide, presentation, history, historyIndex]);

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

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleFullscreenChange = () => {
      const doc = document;
      const fullscreenElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      const isStageFullscreen = stageRef.current && fullscreenElement === stageRef.current;
      setIsPresenting(Boolean(isStageFullscreen));
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach((evt) => document.addEventListener(evt, handleFullscreenChange));

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleFullscreenChange));
    };
  }, []);

  const togglePresent = useCallback(() => {
    if (typeof document === 'undefined') return;
    const elem = stageRef.current;
    if (!elem) return;

    setIsAutoplaying(false);
    const doc = document;
    const fullscreenElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (fullscreenElement === elem) {
      const exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      exitFullscreen?.call(doc);
      setIsPresenting(false);
      return;
    }

    setSelectedElementId(null);
    // Always start presentation from the first slide
    setPresentIndex(0);
    setIsPresenting(true);
    
    const requestFullscreen = 
      elem.requestFullscreen || 
      elem.webkitRequestFullscreen || 
      elem.mozRequestFullScreen || 
      elem.msRequestFullscreen;

    if (requestFullscreen) {
      const promise = requestFullscreen.call(elem);
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => setIsPresenting(false));
      }
    }
  }, [currentSlide]);

  const exitPresent = useCallback(() => {
    if (typeof document === 'undefined') return;
    const doc = document;
    const exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
    exitFullscreen?.call(doc);
    setIsPresenting(false);
    setIsAutoplaying(false);
  }, []);

  const handleZoomStep = useCallback((delta) => {
    setCanvasZoom((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.min(MAX_CANVAS_ZOOM, Math.max(MIN_CANVAS_ZOOM, next));
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setCanvasZoom(1);
  }, []);

  const goNextSlide = useCallback(() => {
    const lastIndex = presentation.slides.length - 1;
    if (lastIndex < 0) return;
    setPresentIndex((idx) => Math.min(idx + 1, lastIndex));
  }, [presentation.slides.length]);

  const goPrevSlide = useCallback(() => {
    if (presentation.slides.length === 0) return;
    setPresentIndex((idx) => Math.max(idx - 1, 0));
  }, [presentation.slides.length]);

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
      // Handle F5 key first (before browser catches it)
      // Handle F5 or F11 for presentation mode (F11 is standard fullscreen in browsers)
      if (e.key === 'F5' || e.key === 'F11' || e.key.toLowerCase() === 'f5' || e.key.toLowerCase() === 'f11') {
        e.preventDefault();
        e.stopPropagation();
        // Small delay to ensure the browser doesn't process the F11 key
        setTimeout(() => togglePresent(), 50);
        return false;
      }

      // Other keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      } else if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          onDeleteElement();
        }
      } else if (selectedElementId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
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
            clampElementToCanvas(el);
          });
        }
      } else if (e.key === 'PageUp' && currentSlide > 0) {
        // Slide navigation with PageUp/PageDown
        e.preventDefault();
        setCurrentSlide(currentSlide - 1);
        setSelectedElementId(null);
      } else if (e.key === 'PageDown' && currentSlide < presentation.slides.length - 1) {
        e.preventDefault();
        setCurrentSlide(currentSlide + 1);
        setSelectedElementId(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        // Quick shortcuts
        e.preventDefault();
        onSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onAddSlide('blank');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, historyIndex, history, currentSlide, presentation.slides.length, onUndo, onRedo, onDeleteElement, updatePresentation, onSave, onAddSlide, togglePresent]);

  useEffect(() => {
    if (!isPresenting) return undefined;

    const handlePresentKeys = (e) => {
      const key = e.key;
      if (key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAutoplaying((prev) => !prev);
        return;
      }
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(key)) {
        e.preventDefault();
        goNextSlide();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) {
        e.preventDefault();
        goPrevSlide();
      } else if (key === 'Home') {
        e.preventDefault();
        setPresentIndex(0);
      } else if (key === 'End') {
        e.preventDefault();
        setPresentIndex(Math.max(0, presentation.slides.length - 1));
      } else if (key === 'Escape') {
        e.preventDefault();
        exitPresent();
      }
    };

    window.addEventListener('keydown', handlePresentKeys, true);
    return () => window.removeEventListener('keydown', handlePresentKeys, true);
  }, [isPresenting, presentation.slides.length, exitPresent, goNextSlide, goPrevSlide]);

  useEffect(() => {
    if (isPresenting && presentation.slides[presentIndex]) {
      setCurrentSlide(presentIndex);
    }
  }, [isPresenting, presentIndex, presentation.slides]);

  useEffect(() => {
    if (!isPresenting) {
      if (isAutoplaying) setIsAutoplaying(false);
      return undefined;
    }
    if (!isAutoplaying) return undefined;

    const lastIndex = presentation.slides.length - 1;
    if (lastIndex <= 0) {
      if (isAutoplaying) setIsAutoplaying(false);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setPresentIndex((prev) => {
        if (prev >= lastIndex) {
          clearInterval(intervalId);
          setIsAutoplaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isPresenting, isAutoplaying, presentation.slides.length]);

  useEffect(() => {
    setPresentIndex((idx) => {
      if (presentation.slides.length === 0) return 0;
      return Math.min(Math.max(idx, 0), presentation.slides.length - 1);
    });
  }, [presentation.slides.length]);

  useEffect(() => {
    if (!dragging && !resizing) return;
    let rafId = null;
    let lastUpdate = { clientX: 0, clientY: 0 };

    function markDraggingMoved() {
      setDragging(prev => {
        if (!prev || prev.hasMoved) return prev;
        return { ...prev, hasMoved: true };
      });
    }

    function handlePointerMove(e) {
      lastUpdate = { clientX: e.clientX, clientY: e.clientY };

      if (dragging && !dragging.hasMoved) {
        markDraggingMoved();
      }
      
      // Cancel previous animation frame if it exists
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      // Use requestAnimationFrame to batch updates
      rafId = requestAnimationFrame(() => {
        if (dragging && dragging.hasMoved) {
          updatePresentation(p => {
            const el = p.slides[currentSlide].elements.find(e=>e.id===dragging.id);
            if (!el) return;
            const scale = dragging.scale || 1;
            const proposedX = dragging.startX + (lastUpdate.clientX - dragging.mouseX) / scale;
            const proposedY = dragging.startY + (lastUpdate.clientY - dragging.mouseY) / scale;
            el.x = proposedX;
            el.y = proposedY;
            clampElementToCanvas(el);
          }, false);
        }
        if (resizing) {
          updatePresentation(p => {
            const el = p.slides[currentSlide].elements.find(e=>e.id===resizing.id);
            if (!el) return;
            const scale = resizing.scale || 1;
            const dx = (lastUpdate.clientX - resizing.mouseX) / scale;
            const dy = (lastUpdate.clientY - resizing.mouseY) / scale;

            let nextX = el.x;
            let nextY = el.y;
            let nextW = el.w;
            let nextH = el.h;

            if (resizing.dir === 'se') {
              nextW = Math.max(20, resizing.startW + dx);
              nextH = Math.max(20, resizing.startH + dy);
            } else if (resizing.dir === 'nw') {
              nextW = Math.max(20, resizing.startW - dx);
              nextH = Math.max(20, resizing.startH - dy);
              nextX = resizing.startX + (resizing.startW - nextW);
              nextY = resizing.startY + (resizing.startH - nextH);
            } else if (resizing.dir === 'ne') {
              nextW = Math.max(20, resizing.startW + dx);
              nextH = Math.max(20, resizing.startH - dy);
              nextY = resizing.startY + (resizing.startH - nextH);
            } else if (resizing.dir === 'sw') {
              nextW = Math.max(20, resizing.startW - dx);
              nextH = Math.max(20, resizing.startH + dy);
              nextX = resizing.startX + (resizing.startW - nextW);
            }

            if (el.type === 'text') {
              const placeholder = typeof el.placeholder === 'string' ? el.placeholder : '';
              const textContent = el.content && el.content.length ? el.content : placeholder;
              const measuredHeight = measureTextHeightForWidth(textContent, el.styles, nextW);
              const minHeight = getMinTextHeight(el.styles);
              const bottomEdge = nextY + nextH;
              const adjustedHeight = Math.max(minHeight, measuredHeight, nextH);
              if (adjustedHeight !== nextH) {
                nextH = adjustedHeight;
                if (resizing.dir.includes('n')) {
                  nextY = bottomEdge - nextH;
                }
              }
            }

            const clamped = clampResizeToCanvas({ x: nextX, y: nextY, w: nextW, h: nextH, dir: resizing.dir });
            el.x = clamped.x;
            el.y = clamped.y;
            el.w = clamped.w;
            el.h = clamped.h;
          }, false);
        }
      });
    }
    const pointerActive = (dragging?.pointerId != null) || (resizing?.pointerId != null);
    function finishInteraction() {
      if (dragging || resizing) {
        if (dragging?.hasMoved) {
          saveHistory(presentation);
        }
      }
      const captureTarget = resizing?.captureTarget || dragging?.captureTarget;
      const pointerId = resizing?.pointerId ?? dragging?.pointerId;
      if (captureTarget?.releasePointerCapture && typeof pointerId === 'number') {
        try { captureTarget.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }
      }
      setDragging(null);
      setResizing(null);
    }
    const handlePointerUp = () => finishInteraction();
    const handlePointerCancel = () => finishInteraction();
    const handleMouseMove = (e) => {
      if (pointerActive) return;
      handlePointerMove(e);
    };
    const handleMouseUp = () => {
      if (pointerActive) return;
      finishInteraction();
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, presentation, currentSlide, saveHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onAddSlide(template) {
    updatePresentation(p => {
      const themeId = p.selectedThemeId || DEFAULT_THEME.id;
      p.slides.splice(currentSlide+1, 0, makeSlide(template, themeId));
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
    const defaultWidth = 600;
    const defaultHeight = 140;
    const centeredX = Math.round((CANVAS_BASE_WIDTH - defaultWidth) / 2);
    const centeredY = Math.round((CANVAS_BASE_HEIGHT - defaultHeight) / 2);
    let newElementId = null;
    updatePresentation(p => {
      const themeConfig = resolveTheme(p.selectedThemeId);
      const element = createThemedTextElement({
        themeConfig,
        variant: 'body',
        x: centeredX,
        y: centeredY,
        w: defaultWidth,
        h: defaultHeight,
        textAlign: 'center',
      });
      newElementId = element.id;
      p.slides[currentSlide].elements.push(element);
    });
    if (newElementId) {
      setSelectedElementId(newElementId);
    }
  }

  function onAddImage(dataUrl) {
    const newElementId = uid('el');
    updatePresentation(p => {
      const el = { id: newElementId, type: 'image', x: 100, y: 150, w: 400, h: 300, rotation: 0, src: dataUrl };
      p.slides[currentSlide].elements.push(el);
    });
    setSelectedElementId(newElementId);
  }

  function onAddChart(chartType) {
    const newElementId = uid('el');
    updatePresentation(p => {
      const themeConfig = resolveTheme(p.selectedThemeId);
      const palette = (themeConfig.chartPalette && themeConfig.chartPalette.length)
        ? themeConfig.chartPalette
        : DEFAULT_CHART_COLORS;
      const labels = ['A', 'B', 'C'];
      const baseDataset = {
        label: 'Series',
        values: [3, 5, 2],
        color: palette[0],
      };
      if (chartType === 'pie') {
        baseDataset.segmentColors = labels.map((_, idx) => palette[idx % palette.length]);
      }
      const el = {
        id: newElementId,
        type: 'chart',
        x: 100,
        y: 150,
        w: 400,
        h: 300,
        rotation: 0,
        chartType,
        data: { labels, datasets: [baseDataset] },
      };
      p.slides[currentSlide].elements.push(el);
    });
    setSelectedElementId(newElementId);
  }

  function onAddShape(shapeType) {
    const newElementId = uid('el');
    updatePresentation(p => {
      const themeConfig = resolveTheme(p.selectedThemeId);
      const shapeDefaults = themeConfig.shapeStyles || {};
      const fillValue = shapeType === 'line'
        ? 'transparent'
        : (shapeDefaults.fill || '#4e79a7');
      const strokeValue = shapeDefaults.stroke || '#000000';
      const strokeWidthValue = typeof shapeDefaults.strokeWidth === 'number'
        ? shapeDefaults.strokeWidth
        : 2;
      const el = {
        id: newElementId,
        type: 'shape',
        x: 300,
        y: 200,
        w: 250,
        h: shapeType === 'line' ? 4 : 200,
        rotation: 0,
        shapeType,
        fill: fillValue,
        stroke: strokeValue,
        strokeWidth: strokeWidthValue,
        shadow: shapeDefaults.shadow || null,
      };
      p.slides[currentSlide].elements.push(el);
    });
    setSelectedElementId(newElementId);
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
        if (!el.content || !el.content.trim()) {
          el.content = '• ';
        } else {
          el.content = lines.map(line => {
            const trimmed = stripMarkers(line).trim();
            if (!trimmed) return '';
            return `• ${trimmed}`;
          }).join('\n');
        }
      } else if (nextStyle === 'number') {
        if (!el.content || !el.content.trim()) {
          el.content = '1. ';
        } else {
          let counter = 1;
          el.content = lines.map(line => {
            const trimmed = stripMarkers(line).trim();
            if (!trimmed) return '';
            return `${counter++}. ${trimmed}`;
          }).join('\n');
        }
      } else {
        el.content = lines.map(line => stripMarkers(line)).join('\n');
      }

      el.styles.listStyle = nextStyle;
    });
  }

  function onChangeText(elId, value, newHeight) {
    updatePresentation(p => {
      const el = p.slides[currentSlide].elements.find(e=>e.id===elId);
      if (el && el.type === 'text') {
        const placeholder = typeof el.placeholder === 'string' ? el.placeholder : null;
        const nextValue = typeof value === 'string' ? value : '';
        el.content = nextValue;

        if (placeholder && (!nextValue || nextValue.trim() === '')) {
          el.content = '';
        }

        if (newHeight !== undefined) {
          const clampedHeight = Math.min(Math.max(newHeight, 20), CANVAS_BASE_HEIGHT);
          el.h = clampedHeight;
          clampElementToCanvas(el);
        }
      }
    }, false);
  }

  function onChangeBackground(color) {
    updatePresentation(p => {
      p.slides[currentSlide].background = color;
    });
  }

  function onDragStart(elId, evt, scale = 1) {
    const el = selectedSlide.elements.find(e=>e.id===elId);
    if (!el) return;
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.target?.setPointerCapture) {
        try { evt.target.setPointerCapture(evt.pointerId); } catch (err) { /* ignore */ }
      }
    }
    setDragging({
      id: elId,
      startX: el.x,
      startY: el.y,
      mouseX: evt?.clientX ?? 0,
      mouseY: evt?.clientY ?? 0,
      scale: scale || 1,
      pointerId: evt?.pointerId,
      captureTarget: evt?.target || null,
      hasMoved: false
    });
  }

  function onResizeStart(elId, dir, evt, scale = 1) {
    const el = selectedSlide.elements.find(e=>e.id===elId);
    if (!el) return;
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.target?.setPointerCapture) {
        try { evt.target.setPointerCapture(evt.pointerId); } catch (err) { /* ignore */ }
      }
    }
    setResizing({
      id: elId,
      dir,
      startX: el.x,
      startY: el.y,
      startW: el.w,
      startH: el.h,
      mouseX: evt?.clientX ?? 0,
      mouseY: evt?.clientY ?? 0,
      scale: scale || 1,
      pointerId: evt?.pointerId,
      captureTarget: evt?.target || null
    });
  }

  function onSave() {
    try {
      const PptxConstructor = resolvePptxGen();
      if (typeof PptxConstructor !== 'function') {
        // Fallback to JSON export if PptxGenJS is not available
        console.warn('PptxGenJS not available, falling back to JSON export');
        const presentationData = {
          ...presentation,
          name: presentation.name || '📄 Untitled',
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
      const pptx = ensureChartEnum(new PptxConstructor(), PptxConstructor);
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'PPT Maker';
      pptx.title = presentation.name || 'Presentation';
      
      presentation.slides.forEach(sl => {
        const slide = pptx.addSlide();
        slide.background = { color: normalizeColor(sl.background || '#ffffff', '#ffffff') };
        
        sl.elements.forEach(el => {
          try {
            if (el.type === 'text') {
              const textOptions = {
                x: pxToIn(el.x || 0),
                y: pxToIn(el.y || 0),
                w: pxToIn(el.w || PX_PER_INCH * 5),
                h: pxToIn(el.h || PX_PER_INCH * 2),
                fontSize: el.styles?.fontSize || 18,
                color: normalizeColor(el.styles?.color || '#111111', '#111111'),
                bold: el.styles?.fontWeight === 'bold',
                italic: el.styles?.fontStyle === 'italic',
                underline: el.styles?.textDecoration === 'underline' ? { style: 'sng' } : false,
                align: el.styles?.textAlign || 'left',
                fontFace: el.styles?.fontFamily || 'Arial',
                valign: 'top'
              };
              if (el.styles?.backgroundColor) {
                const normalizedBg = normalizeColor(el.styles.backgroundColor, el.styles.backgroundColor);
                if (normalizedBg) {
                  textOptions.fill = { color: normalizedBg };
                }
              }
              if (el.styles?.borderColor) {
                const normalizedBorder = normalizeColor(el.styles.borderColor, el.styles.borderColor);
                const normalizedWidth = Number.isFinite(el.styles?.borderWidth) ? Math.max(0, el.styles.borderWidth) : 1;
                if (normalizedBorder) {
                  textOptions.line = { color: normalizedBorder, width: Math.max(0.1, normalizedWidth / PX_PER_INCH) };
                }
              }
              slide.addText(el.content || '', textOptions);
            } else if (el.type === 'image') {
              const imageOptions = prepareImageOptions(el);
              if (imageOptions) {
                slide.addImage(imageOptions);
              }
            } else if (el.type === 'chart') {
              const labels = el.data?.labels || [];
              const datasets = el.data?.datasets || [];
              if (el.chartType === 'pie') {
                buildPieChart(slide, pptx, el, labels, datasets);
              } else {
                buildBarLineChart(slide, pptx, el, labels, datasets);
              }
            } else if (el.type === 'shape') {
              const opts = {
                x: pxToIn(el.x || 0),
                y: pxToIn(el.y || 0),
                w: pxToIn(el.w || PX_PER_INCH),
                h: pxToIn(el.h || PX_PER_INCH),
                fill: { color: normalizeColor(el.fill || '#4e79a7', '#4e79a7') },
                line: {
                  color: normalizeColor(el.stroke || '#000000', '#000000'),
                  width: (el.strokeWidth || 2) / 12,
                },
              };
              if (el.shapeType === 'rect') {
                slide.addShape(pptx.shapes.RECTANGLE, opts);
              } else if (el.shapeType === 'square') {
                const size = Math.min(el.w, el.h);
                slide.addShape(pptx.shapes.RECTANGLE, { ...opts, w: pxToIn(size), h: pxToIn(size) });
              } else if (el.shapeType === 'circle') {
                slide.addShape(pptx.shapes.OVAL, opts);
              } else if (el.shapeType === 'triangle') {
                slide.addShape(pptx.shapes.RIGHT_TRIANGLE, opts);
              } else if (el.shapeType === 'line') {
                slide.addShape(pptx.shapes.LINE, { 
                  x: pxToIn(el.x || 0), 
                  y: pxToIn(el.y || 0), 
                  w: pxToIn(el.w || 0), 
                  h: 0,
                  line: { color: normalizeColor(el.stroke || '#000', '#000000'), width: (el.strokeWidth||2)/12 } 
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
          name: presentation.name || '📄 Untitled',
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

  async function onExport() {
    try {
      const PptxConstructor = resolvePptxGen();
      if (typeof PptxConstructor !== 'function') {
        alert('Export Failed: PptxGenJS library is not loaded. Please check your internet connection and try again.');
        return;
      }

      const pptx = ensureChartEnum(new PptxConstructor(), PptxConstructor);
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'PPT Maker';
      pptx.company = 'PPT Maker';
      pptx.subject = 'Presentation created with PPT Maker';
      pptx.title = presentation.name || 'Presentation';
      pptx.revision = '1.0';

      const themeConfig = resolveTheme(presentation.selectedThemeId);

      presentation.slides.forEach((sl) => {
        const slide = pptx.addSlide();
        const backgroundFill = resolveSlideBackgroundForExport(sl.background || '#ffffff');
        if (backgroundFill.type === 'image') {
          slide.background = { data: backgroundFill.value, sizing: backgroundFill.sizing || 'cover' };
        } else {
          slide.background = { color: normalizeColor(backgroundFill.value, '#ffffff') };
        }

        sl.elements.forEach((el) => {
          try {
            if (el.type === 'text') {
              const textOptions = {
                x: pxToIn(el.x || 0),
                y: pxToIn(el.y || 0),
                w: pxToIn(el.w || PX_PER_INCH * 5),
                h: pxToIn(el.h || PX_PER_INCH * 2),
                fontSize: el.styles?.fontSize || 18,
                color: normalizeColor(el.styles?.color || '#111111', '#111111'),
                bold: el.styles?.fontWeight === 'bold',
                italic: el.styles?.fontStyle === 'italic',
                underline: el.styles?.textDecoration === 'underline' ? { style: 'sng' } : false,
                align: el.styles?.textAlign || 'left',
                fontFace: el.styles?.fontFamily || 'Arial',
                valign: 'top',
              };
              slide.addText(el.content || '', textOptions);
            } else if (el.type === 'image') {
              const imageOptions = prepareImageOptions(el);
              if (imageOptions) {
                slide.addImage(imageOptions);
              }
            } else if (el.type === 'chart') {
              const labels = el.data?.labels || [];
              const datasets = el.data?.datasets || [];
              if (el.chartType === 'pie') {
                buildPieChart(slide, pptx, el, labels, datasets);
              } else {
                buildBarLineChart(slide, pptx, el, labels, datasets);
              }
            } else if (el.type === 'shape') {
              const opts = {
                x: pxToIn(el.x || 0),
                y: pxToIn(el.y || 0),
                w: pxToIn(el.w || PX_PER_INCH),
                h: pxToIn(el.h || PX_PER_INCH),
                fill: { color: normalizeColor(el.fill || '#4e79a7', '#4e79a7') },
                line: { color: normalizeColor(el.stroke || '#000', '#000000'), width: (el.strokeWidth || 2) / 12 },
              };
              if (el.shapeType === 'rect') slide.addShape(pptx.shapes.RECTANGLE, opts);
              else if (el.shapeType === 'square') {
                const size = Math.min(el.w, el.h);
                slide.addShape(pptx.shapes.RECTANGLE, { ...opts, w: pxToIn(size), h: pxToIn(size) });
              } else if (el.shapeType === 'circle') slide.addShape(pptx.shapes.OVAL, opts);
              else if (el.shapeType === 'triangle') slide.addShape(pptx.shapes.RIGHT_TRIANGLE, opts);
              else if (el.shapeType === 'line') {
                slide.addShape(pptx.shapes.LINE, {
                  x: pxToIn(el.x || 0),
                  y: pxToIn(el.y || 0),
                  w: pxToIn(el.w || 0),
                  h: 0,
                  line: { color: normalizeColor(el.stroke || '#000', '#000000'), width: (el.strokeWidth || 2) / 12 },
                });
              }
            }
          } catch (err) {
            console.error('Error adding element to slide:', err);
          }
        });
      });

      const baseBuffer = await pptx.write({ outputType: 'arraybuffer' });
      const themedBuffer = await injectThemePackage(baseBuffer, themeConfig);
      const blob = new Blob([themedBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(presentation.name || 'Presentation').replace(/[^a-z0-9\-_]/gi, '_')}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      alert('Presentation exported successfully! PowerPoint can now detect the embedded theme.');
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    }
  }

  const overlayActive = showLoad || showChartEditor || showShareDialog || isPresenting;

  return (
    <div className="app">
      <Toolbar
        onAddSlide={onAddSlide}
        onAddText={onAddText}
        onAddImage={onAddImage}
        onAddChart={onAddChart}
        onAddShape={onAddShape}
        onDeleteElement={onDeleteElement}
        onSave={onSave}
        onLoad={() => setShowLoad(true)}
        onExport={onExport}
        onShare={onShare}
        onPresent={togglePresent}
        isPresenting={isPresenting}
        presentationName={presentation.name}
        onChangeName={(name) => setPresentation(prev => ({ ...prev, name }))}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onChangeBackground={onChangeBackground}
        currentSlide={selectedSlide}
        onSelectTheme={(themeId) => {
          if (!themeId || themeId === presentation.selectedThemeId) return;
          updatePresentation((draft) => {
            const next = applyThemeToPresentation(draft, themeId);
            Object.assign(draft, next);
          });
        }}
        selectedThemeId={presentation.selectedThemeId}
        currentTheme={currentTheme}
        onZoomIn={() => handleZoomStep(CANVAS_ZOOM_STEP)}
        onZoomOut={() => handleZoomStep(-CANVAS_ZOOM_STEP)}
        onZoomReset={handleZoomReset}
        zoomLevel={canvasZoom}
        minZoom={MIN_CANVAS_ZOOM}
        maxZoom={MAX_CANVAS_ZOOM}
      />

      <div className="main">
        <div className="sidebar-toggle">
          <span className="sidebar-toggle-label">Slides ({presentation.slides.length})</span>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            aria-expanded={!isSidebarCollapsed}
            aria-controls="sidebar-panel"
          >
            {isSidebarCollapsed ? 'Show Slides' : 'Hide Slides'}
          </button>
        </div>
        <div className={`sidebar${isSidebarCollapsed ? ' collapsed' : ''}`} id="sidebar-panel">
          <div className="sidebar-header">
            <div className="sidebar-header__label">SLIDES ({presentation.slides.length})</div>
            <button
              type="button"
              className="sidebar-header__add-btn"
              onClick={() => onAddSlide('titleBody')}
              title="Add new slide"
            >
              + 
            </button>
          </div>
          <div className="sidebar-slides">
            {presentation.slides.map((s, i) => (
              <SlideThumb
                key={s.id}
                slide={s}
                index={i}
                active={i === currentSlide}
                onClick={() => {
                  setCurrentSlide(i);
                  setSelectedElementId(null);
                }}
                onDuplicate={() => onDuplicateSlide(i)}
                onDelete={() => onDeleteSlide(i)}
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

        <div className="stage" ref={stageRef}>
          {selectedSlide && (
            <Canvas
              slide={selectedSlide}
              selectedElementId={selectedElementId}
              draggingElementId={dragging?.id || null}
              onSelect={setSelectedElementId}
              onChangeText={onChangeText}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              isPresenting={isPresenting}
              zoom={canvasZoom}
            />
          )}
          {isPresenting && presentation.slides.length > 0 && (
            <div className="presentation-nav">
              <button
                type="button"
                className="presentation-nav-btn"
                onClick={goPrevSlide}
                disabled={presentIndex === 0}
                aria-label="Previous slide"
                title="Previous slide"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M16 5.75v12.5c0 .66-.75 1.04-1.29.65l-7.5-5.25a.8.8 0 0 1 0-1.3l7.5-5.25c.54-.39 1.29-.01 1.29.65Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={`presentation-nav-btn${isAutoplaying ? ' presentation-nav-btn--active' : ''}`}
                onClick={() => setIsAutoplaying((prev) => !prev)}
                disabled={presentation.slides.length <= 1}
                aria-pressed={isAutoplaying}
                aria-label={isAutoplaying ? 'Pause autoplay' : 'Play slides automatically'}
                title={isAutoplaying ? 'Pause autoplay (K)' : 'Play/Pause'}
              >
                {isAutoplaying ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect x="8" y="5" width="3.1" height="14" rx="1" fill="currentColor" />
                    <rect x="12.9" y="5" width="3.1" height="14" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 5.8c0-.69.76-1.12 1.34-.74l8.6 5.54a.9.9 0 0 1 0 1.52l-8.6 5.54C8.76 17.04 8 16.61 8 15.92V5.8Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
              <span className="presentation-nav-counter">
                {presentIndex + 1} / {presentation.slides.length}
              </span>
              <button
                type="button"
                className="presentation-nav-btn"
                onClick={goNextSlide}
                disabled={presentIndex >= presentation.slides.length - 1}
                aria-label="Next slide"
                title="Next slide"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M8 5.75v12.5c0 .66.75 1.04 1.29.65l7.5-5.25a.8.8 0 0 0 0-1.3l-7.5-5.25C8.75 5.38 8 5.76 8 6.42Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="presentation-nav-btn presentation-nav-exit"
                onClick={exitPresent}
                aria-label="Exit presentation"
                title="Exit presentation"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.5h3V18h4V6h-4v2.5h-3V4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8.47 8.22a.75.75 0 0 1 1.06 1.06L7.81 11H15a.75.75 0 0 1 0 1.5H7.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3.25-3.25a.75.75 0 0 1 0-1.06l3.25-3.25Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedElement && selectedElement.type === 'text' && !overlayActive && (
        <FloatingTextToolbar
          element={selectedElement}
          draggingElementId={dragging?.id || null}
          onStyleChange={(prop, value) => onChangeProp(prop, value)}
          onApplyListStyle={(style) => onApplyListStyle(style)}
          onDelete={() => onDeleteElement()}
        />
      )}
      {selectedElement && (selectedElement.type === 'shape' || selectedElement.type === 'chart' || selectedElement.type === 'image') && !overlayActive && (
        <FloatingShapeToolbar
          element={selectedElement}
          onChangeProp={(prop, value) => onChangeProp(prop, value)}
          onEditChart={() => setShowChartEditor(true)}
          onDelete={() => onDeleteElement()}
        />
      )}

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
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);




