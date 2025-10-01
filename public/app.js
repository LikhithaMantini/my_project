const { useState, useEffect, useRef, useCallback } = React;

// Enhanced data model with shapes, themes, multi-series charts, text formatting
function uid(prefix = 'id') { return prefix + '_' + Math.random().toString(36).slice(2, 9); }

function defaultPresentation() {
  return {
    name: 'Untitled Presentation',
    theme: 'default',
    slides: [ makeSlide('title') ],
  };
}

function makeSlide(template = 'blank', theme = 'default') {
  const slide = { id: uid('slide'), background: theme === 'dark' ? '#1a1a1a' : '#ffffff', elements: [] };
  const textColor = theme === 'dark' ? '#ffffff' : '#111111';
  if (template === 'title') {
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 100, w: 600, h: 80, rotation: 0, styles: { fontSize: 36, color: textColor, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left' }, content: 'Title' });
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 200, w: 600, h: 40, rotation: 0, styles: { fontSize: 20, color: textColor, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left' }, content: 'Subtitle' });
  } else if (template === 'titleContent') {
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 60, w: 600, h: 60, rotation: 0, styles: { fontSize: 32, color: textColor, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left' }, content: 'Title' });
    slide.elements.push({ id: uid('el'), type: 'text', x: 60, y: 150, w: 600, h: 280, rotation: 0, styles: { fontSize: 18, color: textColor, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left' }, content: '• Point 1\n• Point 2\n• Point 3' });
  }
  return slide;
}

// Toolbar with all controls
function Toolbar({ onAddSlide, onAddText, onAddImage, onAddChart, onAddShape, onDeleteElement, onChangeProp, selectedElement, onSave, onLoad, onExport, presentationName, setPresentationName, onUndo, onRedo, canUndo, canRedo, onChangeBackground, currentSlide, onEditChart }) {
  const fileRef = useRef();
  const isText = selectedElement?.type === 'text';
  const isShape = selectedElement?.type === 'shape';
  const isChart = selectedElement?.type === 'chart';
  return (
    <div className="toolbar">
      <div className="tool-row" style={{ borderBottom: '2px solid #e1e4e8', paddingBottom: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: '12px' }}>📊 PPT Maker</div>
        <input className="name-input" value={presentationName} onChange={e=>setPresentationName(e.target.value)} placeholder="Untitled Presentation" />
        <button onClick={onSave} title="Save presentation">💾 Save</button>
        <button onClick={onLoad} title="Load presentation">📂 Load</button>
        <button onClick={onExport} title="Export to PowerPoint">📤 Export</button>
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶ Undo</button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">↷ Redo</button>
      </div>
      <div className="tool-row">
        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Slides</label>
        <button onClick={()=>onAddSlide('title')} title="Add title slide">➕ Title</button>
        <button onClick={()=>onAddSlide('titleContent')} title="Add title + content slide">➕ Title+Content</button>
        <button onClick={()=>onAddSlide('blank')} title="Add blank slide">➕ Blank</button>
        <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Background</label>
        <input type="color" value={currentSlide?.background || '#ffffff'} onChange={e=>onChangeBackground(e.target.value)} title="Slide background color" />
      </div>
      <div className="tool-row">
        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Elements</label>
        <button onClick={onAddText} title="Add text box">📝 Text</button>
        <button onClick={()=>fileRef.current && fileRef.current.click()} title="Upload image">🖼 Image</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={(e)=>{
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => onAddImage(reader.result);
          reader.readAsDataURL(f);
          e.target.value = '';
        }} />
        <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Charts</label>
        <button onClick={()=>onAddChart('bar')} title="Add bar chart">📊 Bar</button>
        <button onClick={()=>onAddChart('line')} title="Add line chart">📈 Line</button>
        <button onClick={()=>onAddChart('pie')} title="Add pie chart">🥧 Pie</button>
        <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Shapes</label>
        <button onClick={()=>onAddShape('rect')} title="Add rectangle">▭ Rect</button>
        <button onClick={()=>onAddShape('circle')} title="Add circle">⬤ Circle</button>
        <button onClick={()=>onAddShape('line')} title="Add line">─ Line</button>
      </div>
      {selectedElement && (
        <div className="tool-row" style={{ background: 'linear-gradient(to right, #f0f4ff, #fef3f8)', padding: '8px', borderRadius: '6px', border: '1px solid #e1e4e8' }}>
          <label style={{ fontSize: '11px', color: '#667eea', fontWeight: '700' }}>✨ Selected: {selectedElement.type.toUpperCase()}</label>
          {isText && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
              <button onClick={()=>onChangeProp('fontWeight', selectedElement.styles?.fontWeight==='bold'?'normal':'bold')} className={selectedElement.styles?.fontWeight==='bold'?'active':''} title="Bold" style={{ fontWeight: 'bold' }}>B</button>
              <button onClick={()=>onChangeProp('fontStyle', selectedElement.styles?.fontStyle==='italic'?'normal':'italic')} className={selectedElement.styles?.fontStyle==='italic'?'active':''} title="Italic" style={{ fontStyle: 'italic' }}>I</button>
              <button onClick={()=>onChangeProp('textDecoration', selectedElement.styles?.textDecoration==='underline'?'none':'underline')} className={selectedElement.styles?.textDecoration==='underline'?'active':''} title="Underline" style={{ textDecoration: 'underline' }}>U</button>
              <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
              <button onClick={()=>onChangeProp('textAlign','left')} className={selectedElement.styles?.textAlign==='left'?'active':''} title="Align left">⬅</button>
              <button onClick={()=>onChangeProp('textAlign','center')} className={selectedElement.styles?.textAlign==='center'?'active':''} title="Align center">⬌</button>
              <button onClick={()=>onChangeProp('textAlign','right')} className={selectedElement.styles?.textAlign==='right'?'active':''} title="Align right">➡</button>
              <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
              <label>Size</label>
              <input type="number" min="8" max="96" value={selectedElement.styles?.fontSize || 18} onChange={e=>onChangeProp('fontSize', parseInt(e.target.value||'18',10))} title="Font size" />
              <label>Color</label>
              <input type="color" value={selectedElement.styles?.color || '#111111'} onChange={e=>onChangeProp('color', e.target.value)} title="Text color" />
            </>
          )}
          {isShape && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
              <label>Fill</label>
              <input type="color" value={selectedElement.fill || '#4e79a7'} onChange={e=>onChangeProp('fill', e.target.value)} title="Fill color" />
              <label>Stroke</label>
              <input type="color" value={selectedElement.stroke || '#000000'} onChange={e=>onChangeProp('stroke', e.target.value)} title="Stroke color" />
              <label>Width</label>
              <input type="number" min="0" max="20" value={selectedElement.strokeWidth || 2} onChange={e=>onChangeProp('strokeWidth', parseInt(e.target.value||'2',10))} title="Stroke width" />
            </>
          )}
          {isChart && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
              <button onClick={onEditChart} title="Edit chart data">✏ Edit Chart Data</button>
            </>
          )}
          <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 4px' }}></div>
          <button onClick={onDeleteElement} title="Delete element (Del)" style={{ background: 'linear-gradient(to bottom, #fee, #fdd)', borderColor: '#fcc', color: '#c33' }}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}

function SlideThumb({ slide, index, active, onClick, onDuplicate, onDelete, onMoveUp, onMoveDown }) {
  const thumbRef = useRef();
  
  useEffect(() => {
    if (active && thumbRef.current) {
      thumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);
  
  return (
    <div ref={thumbRef} className={"slide-thumb" + (active ? ' active' : '')}>
      <div className="slide-thumb-inner" style={{ background: slide.background }} onClick={onClick}>
        {slide.elements.slice(0,2).map(el => (
          <div key={el.id} className="thumb-el" />
        ))}
      </div>
      <div className="slide-num">{index+1}</div>
      <div className="slide-actions">
        <button onClick={onDuplicate} title="Duplicate">⎘</button>
        <button onClick={onDelete} title="Delete">✕</button>
        {index > 0 && <button onClick={onMoveUp} title="Move up">▲</button>}
        {<button onClick={onMoveDown} title="Move down">▼</button>}
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
    <div className="canvas" style={{ background: slide.background }}>
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
  return <div className="drag-handle" onMouseDown={onDragStart} title="Drag to move">✥</div>;
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
  useEffect(()=>{
    fetch('/api/presentations').then(r=>r.json()).then(d=> setItems(d.items||[])).catch(()=>{});
  },[]);
  return (
    <div className="modal">
      <div className="modal-body">
        <h3>Load Presentation</h3>
        <div className="list">
          {items.map(it => (
            <div key={it.id} className="list-item">
              <div>
                <div className="name">{it.name}</div>
                <div className="meta">{it.id} {it.updatedAt ? ' · ' + it.updatedAt : ''}</div>
              </div>
              <button onClick={()=> onLoadId(it.id)}>Open</button>
            </div>
          ))}
        </div>
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
      next[idx].values = value.split(',').map(s=>parseFloat(s.trim())||0);
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
        <input value={labels} onChange={e=>setLabels(e.target.value)} />
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
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  
  const selectedSlide = presentation.slides[currentSlide];
  const selectedElement = selectedSlide?.elements.find(e=>e.id===selectedElementId) || null;

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

  function onAddText() {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'text', x: 80, y: 120, w: 400, h: 80, rotation: 0, styles: { fontSize: 20, color: '#111111', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left' }, content: 'Text' };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onAddImage(dataUrl) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'image', x: 80, y: 120, w: 320, h: 240, rotation: 0, src: dataUrl };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
    });
  }

  function onAddChart(chartType) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'chart', x: 80, y: 120, w: 400, h: 240, rotation: 0, chartType, data: { labels: ['A','B','C'], datasets: [{ label: 'Series 1', values: [3,5,2], color: '#4e79a7' }] } };
      p.slides[currentSlide].elements.push(el);
      setSelectedElementId(el.id);
      setShowChartEditor(true);
    });
  }

  function onAddShape(shapeType) {
    updatePresentation(p => {
      const el = { id: uid('el'), type: 'shape', x: 200, y: 150, w: 200, h: shapeType==='line'?0:150, rotation: 0, shapeType, fill: '#4e79a7', stroke: '#000000', strokeWidth: 2 };
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
    const payload = { ...presentation, id: presentation.id, name: presentation.name };
    fetch('/api/presentations', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      .then(r=>r.json())
      .then(d=>{
        if (d && d.id) setPresentation(prev => ({ ...prev, id: d.id }));
        alert('Saved');
      })
      .catch(()=> alert('Save failed'));
  }

  function onLoad() { setShowLoad(true); }

  function onLoadId(id) {
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
      .catch(()=> alert('Load failed'));
  }

  function onExport() {
    const pptx = new PptxGenJS();
    presentation.slides.forEach(sl => {
      const slide = pptx.addSlide();
      slide.background = { color: (sl.background || '#ffffff').replace('#','') };
      sl.elements.forEach(el => {
        if (el.type === 'text') {
          slide.addText(el.content || '', { x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96, fontSize: el.styles?.fontSize || 18, color: (el.styles?.color||'#111111').replace('#',''), bold: el.styles?.fontWeight==='bold', italic: el.styles?.fontStyle==='italic', underline: el.styles?.textDecoration==='underline', align: el.styles?.textAlign || 'left' });
        } else if (el.type === 'image') {
          slide.addImage({ data: el.src, x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96 });
        } else if (el.type === 'chart') {
          const labels = el.data?.labels || [];
          const datasets = el.data?.datasets || [];
          if (el.chartType === 'pie') {
            const data = datasets[0] ? datasets[0].values.map((v,i)=>({ name: labels[i]||'', labels:[labels[i]||''], values:[v] })) : [];
            slide.addChart(pptx.ChartType.pie, data, { x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96 });
          } else {
            const series = datasets.map(ds => ({ name: ds.label, labels, values: ds.values }));
            const chartType = el.chartType === 'line' ? pptx.ChartType.line : pptx.ChartType.bar;
            slide.addChart(chartType, series, { x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96, barDir: 'col', chartColors: datasets.map(ds=>(ds.color||'#4e79a7').replace('#','')) });
          }
        } else if (el.type === 'shape') {
          const opts = { x: el.x/96, y: el.y/96, w: el.w/96, h: el.h/96, fill: { color: (el.fill||'#4e79a7').replace('#','') }, line: { color: (el.stroke||'#000').replace('#',''), width: el.strokeWidth||2 } };
          if (el.shapeType === 'rect') slide.addShape(pptx.ShapeType.rect, opts);
          else if (el.shapeType === 'circle') slide.addShape(pptx.ShapeType.ellipse, opts);
          else if (el.shapeType === 'line') slide.addShape(pptx.ShapeType.line, { ...opts, line: { color: (el.stroke||'#000').replace('#',''), width: (el.strokeWidth||2)*2 } });
        }
      });
    });
    pptx.writeFile({ fileName: (presentation.name || 'Presentation') + '.pptx' });
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
        onLoad={onLoad}
        onExport={onExport}
        presentationName={presentation.name}
        setPresentationName={(name)=> setPresentation(prev=> ({...prev, name}))}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onChangeBackground={onChangeBackground}
        currentSlide={selectedSlide}
        onEditChart={()=>setShowChartEditor(true)}
      />

      <div className="main">
        <div className="sidebar">
          <div className="sidebar-header">
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>SLIDES</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={()=>{ if(currentSlide > 0) { setCurrentSlide(currentSlide - 1); setSelectedElementId(null); }}} 
                disabled={currentSlide === 0}
                title="Previous slide (scroll up)"
                style={{ flex: 1, padding: '6px' }}>
                ▲ Prev
              </button>
              <button 
                onClick={()=>{ if(currentSlide < presentation.slides.length - 1) { setCurrentSlide(currentSlide + 1); setSelectedElementId(null); }}} 
                disabled={currentSlide === presentation.slides.length - 1}
                title="Next slide (scroll down)"
                style={{ flex: 1, padding: '6px' }}>
                ▼ Next
              </button>
            </div>
          </div>
          <div className="sidebar-slides">
            {presentation.slides.map((s, i) => (
              <SlideThumb
                key={s.id}
                slide={s}
                index={i}
                active={i===currentSlide}
                onClick={()=>{ setCurrentSlide(i); setSelectedElementId(null); }}
                onDuplicate={()=>onDuplicateSlide(i)}
                onDelete={()=>onDeleteSlide(i)}
                onMoveUp={()=>onMoveSlide(i, 'up')}
                onMoveDown={()=>onMoveSlide(i, 'down')}
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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
