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
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
// Serve static files dari folder root (di mana server.js berada)
app.use(express.static(__dirname));

// Buat folder db jika tidak ada
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// Init database
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'dashboard.db');
const db = new Database(dbPath);
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
  console.log('✓ Database tables initialized');
}

initDatabase();

// ============ API Endpoints ============

// GET Arsiparis
app.get('/api/arsiparis', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM arsiparis ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Arsiparis
app.post('/api/arsiparis', (req, res) => {
  try {
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = req.body;
    const stmt = db.prepare(
      'INSERT INTO arsiparis (name, nip, golongan, pangkat, unit, kecamatan, tahun) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, nip, golongan, pangkat, unit, kecamatan, tahun);
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Arsiparis
app.put('/api/arsiparis/:id', (req, res) => {
  try {
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = req.body;
    db.prepare(
      'UPDATE arsiparis SET name=?, nip=?, golongan=?, pangkat=?, unit=?, kecamatan=?, tahun=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(name, nip, golongan, pangkat, unit, kecamatan, tahun, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Arsiparis
app.delete('/api/arsiparis/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM arsiparis WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Gallery
app.get('/api/gallery', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, caption, created_at FROM gallery ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single Gallery Image
app.get('/api/gallery/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT data_base64 FROM gallery WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row.data_base64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Gallery (simpan base64)
app.post('/api/gallery/upload', (req, res) => {
  try {
    const { dataURL, caption } = req.body;
    if (!dataURL) return res.status(400).json({ error: 'No image data' });
    
    const stmt = db.prepare('INSERT INTO gallery (caption, data_base64) VALUES (?, ?)');
    const result = stmt.run(caption || '', dataURL);
    res.json({ id: result.lastInsertRowid, caption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Gallery
app.delete('/api/gallery/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Eviden
app.get('/api/eviden', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, kecamatan, unit, tahun, note, created_at FROM eviden ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single Eviden
app.get('/api/eviden/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT data_base64 FROM eviden WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row.data_base64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Eviden
app.post('/api/eviden/upload', (req, res) => {
  try {
    const { dataURL, kecamatan, unit, tahun, note } = req.body;
    if (!dataURL) return res.status(400).json({ error: 'No image data' });
    
    const stmt = db.prepare('INSERT INTO eviden (kecamatan, unit, tahun, note, data_base64) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(kecamatan, unit, tahun, note || '', dataURL);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Eviden
app.delete('/api/eviden/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM eviden WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
