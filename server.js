#!/usr/bin/env node
/**
 * Simple Database Server untuk Dashboard Arsiparis
 * 
 * CARA JALANKAN:
 * 1. npm install express cors multer better-sqlite3
 * 2. node server.js
 * 3. Buka: http://localhost:5000
 * 
 * Database otomatis dibuat di folder ./db/data.db
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// try to load better-sqlite3, but fail gracefully for serverless (Vercel)
let useSqlite = true;
let Database;
let db = null;
let dbPath = '(in-memory)';

try {
  // If running on Vercel serverless, don't attempt to load native sqlite module
  if (process.env.VERCEL) throw new Error('Running on Vercel - skip sqlite');
  Database = require('better-sqlite3');
} catch (err) {
  useSqlite = false;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Serve static files dari folder root (di mana server.js berada)
app.use(express.static(__dirname));

// In-memory fallback storage
const memory = {
  arsiparis: [],
  gallery: [],
  eviden: []
};
const counters = { arsiparis: 1, gallery: 1, eviden: 1 };

// Initialize sqlite DB only when available (local dev)
if (useSqlite) {
  // Buat folder db jika tidak ada
  const dbDir = path.join(__dirname, 'db');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  dbPath = path.join(dbDir, 'dashboard.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Auto create tables saat startup
  function initDatabase() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS arsiparis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nip TEXT,
        golongan TEXT,
        pangkat TEXT,
        unit TEXT,
        kecamatan TEXT,
        tahun INTEGER,
        nilai_pengawasan TEXT,
        nilai_skpd TEXT,
        catatan TEXT,
        rekomendasi TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caption TEXT,
        data_base64 LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS eviden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kecamatan TEXT,
        unit TEXT,
        tahun INTEGER,
        note TEXT,
        data_base64 LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Database tables initialized (SQLite)');
  }

  initDatabase();
} else {
  console.log('⚠️  better-sqlite3 not available — using in-memory storage (no persistence).');
}

// ============ API Endpoints ============
// Helper functions to abstract sqlite vs in-memory
function getArsiparis() {
  if (useSqlite) return db.prepare('SELECT * FROM arsiparis ORDER BY created_at DESC').all();
  return memory.arsiparis.slice().reverse();
}
function addArsiparis(payload) {
  if (useSqlite) {
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = payload;
    const stmt = db.prepare('INSERT INTO arsiparis (name, nip, golongan, pangkat, unit, kecamatan, tahun) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, nip, golongan, pangkat, unit, kecamatan, tahun);
    return { id: result.lastInsertRowid, ...payload };
  }
  const id = counters.arsiparis++;
  const item = { id, ...payload, created_at: new Date().toISOString() };
  memory.arsiparis.push(item);
  return item;
}
function updateArsiparis(id, payload) {
  if (useSqlite) {
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = payload;
    db.prepare('UPDATE arsiparis SET name=?, nip=?, golongan=?, pangkat=?, unit=?, kecamatan=?, tahun=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name, nip, golongan, pangkat, unit, kecamatan, tahun, id);
    return { id, ...payload };
  }
  const idx = memory.arsiparis.findIndex(x => x.id == id);
  if (idx === -1) return null;
  memory.arsiparis[idx] = { ...memory.arsiparis[idx], ...payload, updated_at: new Date().toISOString() };
  return memory.arsiparis[idx];
}
function deleteArsiparis(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM arsiparis WHERE id = ?').run(id);
    return true;
  }
  const idx = memory.arsiparis.findIndex(x => x.id == id);
  if (idx === -1) return false;
  memory.arsiparis.splice(idx, 1);
  return true;
}

// Gallery helpers
function getGallery() {
  if (useSqlite) return db.prepare('SELECT id, caption, created_at FROM gallery ORDER BY created_at DESC').all();
  return memory.gallery.slice().reverse();
}
function getGalleryData(id) {
  if (useSqlite) {
    const row = db.prepare('SELECT data_base64 FROM gallery WHERE id = ?').get(id);
    return row ? row.data_base64 : null;
  }
  const item = memory.gallery.find(x => x.id == id);
  return item ? item.data_base64 : null;
}
function addGallery(payload) {
  if (useSqlite) {
    const { dataURL, caption } = payload;
    const stmt = db.prepare('INSERT INTO gallery (caption, data_base64) VALUES (?, ?)');
    const result = stmt.run(caption || '', dataURL);
    return { id: result.lastInsertRowid, caption };
  }
  const id = counters.gallery++;
  const item = { id, caption: payload.caption || '', data_base64: payload.dataURL, created_at: new Date().toISOString() };
  memory.gallery.push(item);
  return item;
}
function deleteGallery(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
    return true;
  }
  const idx = memory.gallery.findIndex(x => x.id == id);
  if (idx === -1) return false;
  memory.gallery.splice(idx, 1);
  return true;
}

// Eviden helpers
function getEviden() {
  if (useSqlite) return db.prepare('SELECT id, kecamatan, unit, tahun, note, created_at FROM eviden ORDER BY created_at DESC').all();
  return memory.eviden.slice().reverse();
}
function getEvidenData(id) {
  if (useSqlite) {
    const row = db.prepare('SELECT data_base64 FROM eviden WHERE id = ?').get(id);
    return row ? row.data_base64 : null;
  }
  const item = memory.eviden.find(x => x.id == id);
  return item ? item.data_base64 : null;
}
function addEviden(payload) {
  if (useSqlite) {
    const { dataURL, kecamatan, unit, tahun, note } = payload;
    const stmt = db.prepare('INSERT INTO eviden (kecamatan, unit, tahun, note, data_base64) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(kecamatan, unit, tahun, note || '', dataURL);
    return { id: result.lastInsertRowid };
  }
  const id = counters.eviden++;
  const item = { id, kecamatan: payload.kecamatan, unit: payload.unit, tahun: payload.tahun, note: payload.note || '', data_base64: payload.dataURL, created_at: new Date().toISOString() };
  memory.eviden.push(item);
  return item;
}
function deleteEviden(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM eviden WHERE id = ?').run(id);
    return true;
  }
  const idx = memory.eviden.findIndex(x => x.id == id);
  if (idx === -1) return false;
  memory.eviden.splice(idx, 1);
  return true;
}

// GET Arsiparis
app.get('/api/arsiparis', (req, res) => {
  try {
    res.json(getArsiparis());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Arsiparis
app.post('/api/arsiparis', (req, res) => {
  try {
    const item = addArsiparis(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT Arsiparis
app.put('/api/arsiparis/:id', (req, res) => {
  try {
    const updated = updateArsiparis(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Arsiparis
app.delete('/api/arsiparis/:id', (req, res) => {
  try {
    const ok = deleteArsiparis(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Gallery
app.get('/api/gallery', (req, res) => {
  try { res.json(getGallery()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Single Gallery Image
app.get('/api/gallery/:id', (req, res) => {
  try {
    const data = getGalleryData(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Gallery (simpan base64)
app.post('/api/gallery/upload', (req, res) => {
  try {
    const item = addGallery(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Gallery
app.delete('/api/gallery/:id', (req, res) => {
  try {
    const ok = deleteGallery(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Eviden
app.get('/api/eviden', (req, res) => {
  try { res.json(getEviden()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Single Eviden
app.get('/api/eviden/:id', (req, res) => {
  try {
    const data = getEvidenData(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Eviden
app.post('/api/eviden/upload', (req, res) => {
  try {
    const item = addEviden(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Eviden
app.delete('/api/eviden/:id', (req, res) => {
  try {
    const ok = deleteEviden(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ Health Check ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: 'ready' });
});

// ============ Start Server ============
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Dashboard Arsiparis Server Running!                  ║
╠════════════════════════════════════════════════════════╣
║  🌐 Frontend: http://localhost:${PORT}                      
║  📊 API: http://localhost:${PORT}/api/                    
║  📁 Database: ${dbPath}
║  ✓ Tables: arsiparis, gallery, eviden            
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Closing database...');
  db.close();
  process.exit(0);
});
