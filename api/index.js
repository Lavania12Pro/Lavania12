/**
 * Vercel Serverless Function Handler
 * This file exports the Express app for Vercel
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Init database
const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'dashboard.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Auto create tables
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
      filename TEXT UNIQUE,
      caption TEXT,
      image_data BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS eviden (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      document_data BLOB,
      file_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Database tables initialized');
}

initDatabase();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: 'ready' });
});

app.get('/api/arsiparis', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM arsiparis ORDER BY id DESC').all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/arsiparis', (req, res) => {
  try {
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi } = req.body;
    const stmt = db.prepare(`
      INSERT INTO arsiparis (name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi);
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/arsiparis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi } = req.body;
    db.prepare(`
      UPDATE arsiparis SET name=?, nip=?, golongan=?, pangkat=?, unit=?, kecamatan=?, tahun=?, nilai_pengawasan=?, nilai_skpd=?, catatan=?, rekomendasi=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi, id);
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/arsiparis/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM arsiparis WHERE id=?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gallery', (req, res) => {
  try {
    const data = db.prepare('SELECT id, caption FROM gallery ORDER BY id DESC').all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery', (req, res) => {
  try {
    const { filename, caption, image_data } = req.body;
    const stmt = db.prepare('INSERT INTO gallery (filename, caption, image_data) VALUES (?, ?, ?)');
    const info = stmt.run(filename, caption, image_data);
    res.json({ id: info.lastInsertRowid, filename, caption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/eviden', (req, res) => {
  try {
    const data = db.prepare('SELECT id, title FROM eviden ORDER BY id DESC').all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/eviden', (req, res) => {
  try {
    const { title, document_data, file_type } = req.body;
    const stmt = db.prepare('INSERT INTO eviden (title, document_data, file_type) VALUES (?, ?, ?)');
    const info = stmt.run(title, document_data, file_type);
    res.json({ id: info.lastInsertRowid, title, file_type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all for SPA (serve index.html for unknown routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
