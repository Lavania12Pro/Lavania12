require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.API_PORT || 5001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Pool config from env
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'dapuser',
  password: process.env.PGPASSWORD || 'dapsecret',
  database: process.env.PGDATABASE || 'dapdb'
});

async function testDb(){
  try{
    const r = await pool.query('SELECT 1');
    console.log('✓ Connected to Postgres');
  }catch(err){
    console.error('Postgres connection failed:', err.message);
    process.exit(1);
  }
}

// Serve frontend (optional) - assume parent folder contains frontend
app.use('/', express.static(path.join(__dirname, '..')));

// =========== API ===========
// Get arsiparis
app.get('/api/arsiparis', async (req, res)=>{
  try{
    const rows = (await pool.query('SELECT * FROM arsiparis ORDER BY created_at DESC LIMIT 1000')).rows;
    res.json(rows);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Add arsiparis
app.post('/api/arsiparis', async (req, res)=>{
  try{
    const { name, nip, golongan, pangkat, unit, kecamatan, tahun, nilai_pengawasan, nilai_skpd, catatan, rekomendasi } = req.body;
    const q = `INSERT INTO arsiparis (name,nip,golongan,pangkat,unit,kecamatan,tahun,nilai_pengawasan,nilai_skpd,catatan,rekomendasi) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11) RETURNING *`;
    const vals = [name,nip,golongan,pangkat,unit,kecamatan,tahun, JSON.stringify(nilai_pengawasan||{}), JSON.stringify(nilai_skpd||{}), catatan||'', rekomendasi||''];
    const row = (await pool.query(q, vals)).rows[0];
    res.json(row);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Get gallery list
app.get('/api/gallery', async (req, res)=>{
  try{
    const rows = (await pool.query('SELECT * FROM gallery ORDER BY created_at DESC')).rows;
    res.json(rows);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Upload gallery (store URL or base64) - for simplicity accept dataURL and store as url
app.post('/api/gallery/upload', async (req, res)=>{
  try{
    const { caption, url, uploaded_by } = req.body; // url can be dataURL or remote URL
    const q = 'INSERT INTO gallery (caption,url,uploaded_by) VALUES ($1,$2,$3) RETURNING *';
    const row = (await pool.query(q, [caption||'', url||'', uploaded_by||'admin'])).rows[0];
    res.json(row);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Get eviden list
app.get('/api/eviden', async (req, res)=>{
  try{
    const rows = (await pool.query('SELECT * FROM eviden ORDER BY created_at DESC')).rows;
    res.json(rows);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Upload eviden
app.post('/api/eviden/upload', async (req, res)=>{
  try{
    const { kecamatan, unit, tahun, note, url, uploaded_by } = req.body;
    const q = 'INSERT INTO eviden (kecamatan,unit,tahun,note,url,uploaded_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *';
    const row = (await pool.query(q, [kecamatan||'', unit||'', tahun||null, note||'', url||'', uploaded_by||'admin'])).rows[0];
    res.json(row);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Health
app.get('/api/health', async (req, res)=>{ res.json({ status: 'OK' }); });

// Start
(async ()=>{
  await testDb();
  app.listen(PORT, ()=> console.log(`Postgres server running on port ${PORT}`));
})();
