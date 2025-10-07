const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(PUBLIC_DIR));

// Helpers
function listPresentations() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const id = path.basename(f, '.json');
    try {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8'));
      return { id, name: content.name || id, updatedAt: content.updatedAt || null };
    } catch {
      return { id, name: id, updatedAt: null };
    }
  });
}

// API routes
app.get('/api/presentations', (req, res) => {
  return res.json({ items: listPresentations() });
});

app.get('/api/presentations/:id', (req, res) => {
  const file = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read presentation' });
  }
});

app.post('/api/presentations', (req, res) => {
  // Upsert by id; if no id, generate one
  const body = req.body || {};
  const id = (body.id || Date.now().toString());
  const payload = { ...body, id, updatedAt: new Date().toISOString() };
  const file = path.join(DATA_DIR, `${id}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save presentation' });
  }
});

app.delete('/api/presentations/:id', (req, res) => {
  const file = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  try {
    fs.unlinkSync(file);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete presentation' });
  }
});

// Fallback to index.html for basic SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
