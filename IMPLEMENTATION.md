# Implementasi Database — Step-by-Step Guide

Panduan lengkap untuk mengintegrasikan database ke dashboard.

---

## **🎯 Overview**

Anda punya **3 pilihan**:

| Opsi | Cara | Data Disimpan | Cocok Untuk |
|------|------|---------------|-----------|
| **A (Lokal)** | Browser localStorage | Browser (hilang refresh) | Testing |
| **B (Database)** | SQLite di komputer | File `db/dashboard.db` | Development |
| **C (Cloud)** | Railway + database | Cloud server | Production |

**Rekomendasi:** Mulai dari **B**, lalu upgrade ke **C** saat siap production.

---

## **OPSI A: Tetap Pakai localStorage (Sekarang)**

Tidak perlu apa-apa. Sudah jalan. Data hilang saat refresh.

---

## **OPSI B: Gunakan SQLite Database (Recommended)**

### **Setup (5 menit)**

**Langkah 1: Install Node.js**

Download: https://nodejs.org/ (pilih LTS)

Cek:
```bash
node --version
npm --version
```

**Langkah 2: Install Dependencies**

Terminal, masuk folder:
```bash
cd d:/ASKI/dashboard-arsiparis-dap
npm install
```

Output:
```
added 52 packages in 15s
```

**Langkah 3: Jalankan Server**

```bash
npm start
```

Output:
```
╔════════════════════════════════════════════════════════╗
║  Dashboard Arsiparis Server Running!                  ║
╠════════════════════════════════════════════════════════╣
║  🌐 Frontend: http://localhost:5000                      
║  📊 API: http://localhost:5000/api/                    
║  📁 Database: ./db/dashboard.db
║  ✓ Tables: arsiparis, gallery, eviden            
╚════════════════════════════════════════════════════════╝
```

**Langkah 4: Buka Browser**

http://localhost:5000

✅ **Database sudah jalan!**

---

### **Mengaktifkan Frontend Pakai Database**

**Sekarang dashboard masih pakai localStorage.** Untuk pakai database:

#### **Opsi B1: Pergi ke index.html**

Edit `index.html`, cari baris:
```html
<script src="assets/js/app.js"></script>
```

Ubah menjadi:
```html
<script src="assets/js/app-with-api.js"></script>
```

**Kemudian refresh browser.**

✅ **Selesai!** Data sekarang tersimpan di database.

#### **Opsi B2: Manual Update app.js**

Jika ingin update `app.js` sendiri, lihat file `app-with-api.js` sebagai referensi. Caranya:
- Ganti `localStorage` calls dengan `apiCall('GET'/'POST'/'DELETE')`
- Test setiap fitur (search, upload, delete)

---

## **OPSI C: Deploy ke Cloud (Railway)**

### **Persiapan**

Sudah punya:
- ✅ `server.js` — backend
- ✅ `package.json` — dependencies
- ✅ GitHub account
- ✅ Railway account (https://railway.app)

### **Deploy Steps**

**Langkah 1: Push ke GitHub**

```bash
cd d:/ASKI/dashboard-arsiparis-dap
git add .
git commit -m "Add database"
git push
```

**Langkah 2: Buka Railway.app**

Klik "New Project" → "Import from GitHub"

**Langkah 3: Select Repository**

Pilih `dashboard-arsiparis-dap`

**Langkah 4: Railway Auto-Detect**

Railway akan detect `package.json` dan Node.js

**Langkah 5: Deploy**

Klik "Deploy" → tunggu 2-3 menit

**Langkah 6: Get URL**

Railway berikan URL seperti:
```
https://dashboard-arsiparis-backend-production.up.railway.app
```

**Langkah 7: Update Frontend**

Di `app-with-api.js`, ubah:
```javascript
const API_BASE = 'http://localhost:5000';
```

Menjadi:
```javascript
const API_BASE = 'https://dashboard-arsiparis-backend-production.up.railway.app';
```

**Langkah 8: Test**

Akses: `https://dashboard-arsiparis-backend-production.up.railway.app`

✅ **Website + Database sudah online!**

---

## **🔧 Testing API Manually**

Sebelum integrate ke frontend, test API:

**Terminal baru:**
```bash
# Test health
curl http://localhost:5000/api/health

# Get arsiparis
curl http://localhost:5000/api/arsiparis

# Add arsiparis
curl -X POST http://localhost:5000/api/arsiparis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi",
    "nip": "12345",
    "unit": "Dinas",
    "kecamatan": "Cibinong",
    "tahun": 2025
  }'

# Get gallery
curl http://localhost:5000/api/gallery
```

---

## **💾 Database File**

Lokasi:
```
dashboard-arsiparis-dap/
└── db/
    └── dashboard.db    ← SQLite database
```

Backup:
```bash
# Copy file db/dashboard.db ke tempat aman
cp db/dashboard.db db/dashboard.db.backup
```

Restore:
```bash
# Copy kembali
cp db/database.db.backup db/database.db
npm start
```

---

## **📊 Data Structure**

### **arsiparis Table**
```sql
CREATE TABLE arsiparis (
  id INTEGER PRIMARY KEY,
  name TEXT,
  nip TEXT,
  golongan TEXT,
  pangkat TEXT,
  unit TEXT,
  kecamatan TEXT,
  tahun INTEGER,
  nilai_pengawasan TEXT,   -- JSON
  nilai_skpd TEXT,         -- JSON
  catatan TEXT,
  rekomendasi TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### **gallery Table**
```sql
CREATE TABLE gallery (
  id INTEGER PRIMARY KEY,
  caption TEXT,
  data_base64 LONGTEXT,    -- Base64 encoded image
  created_at DATETIME
);
```

### **eviden Table**
```sql
CREATE TABLE eviden (
  id INTEGER PRIMARY KEY,
  kecamatan TEXT,
  unit TEXT,
  tahun INTEGER,
  note TEXT,
  data_base64 LONGTEXT,    -- Base64 encoded image
  created_at DATETIME
);
```

---

## **🐛 Troubleshooting**

| Masalah | Solusi |
|--------|--------|
| "npm install" gagal | Pastikan Node.js installed, coba: `npm cache clean --force` |
| Server tidak start | Port 5000 mungkin busy, cek: `netstat -an` |
| CORS error di browser | Normal, API include CORS header, cek console error |
| Database tidak ada di `db/` | Auto-created saat server start, lihat console output |
| Data tidak muncul | Cek: (1) Server jalan? (2) API_BASE correct? (3) Console errors? |

---

## **✨ Keuntungan Database**

✅ Data persisten (tidak hilang saat refresh/server restart)  
✅ Bisa akses dari berbagai device (saat di cloud)  
✅ Backup mudah (copy file `db/dashboard.db`)  
✅ Query data lebih cepat  
✅ Ready untuk scale-up  

---

## **🚀 Next Steps**

1. **Setup lokal dulu** (Opsi B) — test semua fitur
2. **Pastikan berjalan** — tidak ada error di console
3. **Deploy ke cloud** (Opsi C) — untuk production
4. **Backup database** — jangan sampai data hilang

---

## **File Penting**

| File | Fungsi |
|------|--------|
| `server.js` | Backend server |
| `package.json` | Dependencies |
| `assets/js/app-with-api.js` | Frontend pakai API |
| `db/dashboard.db` | Database file (auto-created) |

---

**Siap setup database? Mulai dari OPSI B!** 🚀
