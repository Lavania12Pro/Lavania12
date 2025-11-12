const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../dashboard-arsiparis-dap')));

// Setup upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Setup SQLite database
const db = new Database(path.join(__dirname, 'data.db'));

// Initialize tables
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
    nilai_pengawasan JSON,
    nilai_skpd JSON,
    catatan TEXT,
    rekomendasi TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caption TEXT,
    filename TEXT NOT NULL,
    original_name TEXT,
    uploaded_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS eviden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kecamatan TEXT,
    unit TEXT,
    tahun INTEGER,
    note TEXT,
    filename TEXT,
    original_name TEXT,
    uploaded_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============ API Endpoints ============

// GET: Frontend (serve static files)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard-arsiparis-dap/index.html'));
});

// ============ GALLERY API ============

// POST: Upload gallery photo
app.post('/api/gallery/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const stmt = db.prepare(
    'INSERT INTO gallery (caption, filename, original_name, uploaded_by) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(req.body.caption || '', req.file.filename, req.file.originalname, req.body.uploadedBy || 'admin');

  res.json({
    id: result.lastInsertRowid,
    caption: req.body.caption || '',
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname
  });
});

// GET: List gallery photos
app.get('/api/gallery', (req, res) => {
  const rows = db.prepare('SELECT id, caption, filename, original_name, created_at FROM gallery ORDER BY created_at DESC').all();
  res.json(rows.map(r => ({
    id: r.id,
    caption: r.caption,
    url: `/uploads/${r.filename}`,
    originalName: r.original_name,
    createdAt: r.created_at
  })));
});

// DELETE: Remove gallery photo
app.delete('/api/gallery/:id', (req, res) => {
  const row = db.prepare('SELECT filename FROM gallery WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Photo not found' });

  const filePath = path.join(uploadDir, row.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ ARSIPARIS API ============

// GET: List arsiparis
app.get('/api/arsiparis', (req, res) => {
  const rows = db.prepare('SELECT * FROM arsiparis ORDER BY created_at DESC').all();
  res.json(rows);
});

// POST: Add arsiparis
app.post('/api/arsiparis', (req, res) => {
  const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = req.body;
  const stmt = db.prepare(
    'INSERT INTO arsiparis (name, nip, golongan, pangkat, unit, kecamatan, tahun) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, nip, golongan, pangkat, unit, kecamatan, tahun);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

// PUT: Update arsiparis
app.put('/api/arsiparis/:id', (req, res) => {
  const { name, nip, golongan, pangkat, unit, kecamatan, tahun } = req.body;
  db.prepare(
    'UPDATE arsiparis SET name=?, nip=?, golongan=?, pangkat=?, unit=?, kecamatan=?, tahun=? WHERE id=?'
  ).run(name, nip, golongan, pangkat, unit, kecamatan, tahun, req.params.id);
  res.json({ id: req.params.id, ...req.body });
});

// DELETE: Remove arsiparis
app.delete('/api/arsiparis/:id', (req, res) => {
  db.prepare('DELETE FROM arsiparis WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ EVIDEN API ============

// GET: List eviden
app.get('/api/eviden', (req, res) => {
  const rows = db.prepare('SELECT id, kecamatan, unit, tahun, note, original_name, created_at FROM eviden ORDER BY created_at DESC').all();
  res.json(rows.map(r => ({
    ...r,
    url: `/uploads/${r.filename}`
  })));
});

// POST: Upload eviden
app.post('/api/eviden/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const { kecamatan, unit, tahun, note, uploadedBy } = req.body;
  const stmt = db.prepare(
    'INSERT INTO eviden (kecamatan, unit, tahun, note, filename, original_name, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(kecamatan, unit, tahun, note, req.file.filename, req.file.originalname, uploadedBy || 'admin');
  res.json({
    id: result.lastInsertRowid,
    url: `/uploads/${req.file.filename}`,
    kecamatan, unit, tahun, note
  });
});

// DELETE: Remove eviden
app.delete('/api/eviden/:id', (req, res) => {
  const row = db.prepare('SELECT filename FROM eviden WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const filePath = path.join(uploadDir, row.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM eviden WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ Serve uploads ============
app.use('/uploads', express.static(uploadDir));

// ============ Start Server ============
app.listen(PORT, () => {
  console.log(`✓ Dashboard Arsiparis Backend running on port ${PORT}`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
  console.log(`✓ Database: ${path.join(__dirname, 'data.db')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
