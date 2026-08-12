const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ──────────────────────────────────────────────
function readContent() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeContent(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── API: Public read ─────────────────────────────────────
app.get('/api/content', (_req, res) => {
  try {
    const data = readContent();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── API: Admin – update full content ─────────────────────
app.put('/api/content', (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
    }
    writeContent(data);
    res.json({ ok: true, message: 'Content saved successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── API: Admin – update a single section ─────────────────
app.patch('/api/content/:section', (req, res) => {
  try {
    const { section } = req.params;
    const data = readContent();
    if (!(section in data) && section !== 'hero' && section !== 'about' &&
        section !== 'skills' && section !== 'projects' && section !== 'links' &&
        section !== 'footer' && section !== 'theme' && section !== 'domain') {
      return res.status(400).json({ ok: false, error: `Unknown section: ${section}` });
    }
    data[section] = req.body;
    writeContent(data);
    res.json({ ok: true, message: `Section "${section}" updated` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── SPA fallback (Express 5 syntax) ────────────────────
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Domain Showcase running at http://localhost:${PORT}`);
  console.log(`📝 Admin panel:  http://localhost:${PORT}/admin.html`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/content\n`);
});
