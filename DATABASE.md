# Setup Database — Cara Paling Mudah

Panduan singkat untuk setup database SQLite tanpa ribet.

---

## **⚡ QUICK START (5 MENIT)**

### **Langkah 1: Install Node.js**
Jika belum punya Node.js, download di: https://nodejs.org/ (pilih LTS)

Cek instalasi:
```bash
node --version
npm --version
```

### **Langkah 2: Install Dependencies**
Buka terminal, masuk ke folder proyek:
```bash
cd d:/ASKI/dashboard-arsiparis-dap
npm install
```

Selesai! Semua library sudah installed. File `package.json` sudah disiapkan.

### **Langkah 3: Jalankan Server**
```bash
npm start
```

Output akan terlihat seperti:
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

### **Langkah 4: Buka Browser**
Buka: **http://localhost:5000**

✅ **Selesai! Database sudah jalan!**

---

## **📊 Database Structure**

Database punya 3 tabel:

### **1. arsiparis**
Menyimpan data arsiparis (nama, NIP, unit, dll)
```
id (auto)
name, nip, golongan, pangkat, unit, kecamatan, tahun
nilai_pengawasan, nilai_skpd, catatan, rekomendasi
created_at, updated_at
```

### **2. gallery**
Menyimpan foto kegiatan (disimpan sebagai base64)
```
id (auto)
caption (keterangan)
data_base64 (foto dalam format base64)
created_at
```

### **3. eviden**
Menyimpan foto eviden per unit
```
id (auto)
kecamatan, unit, tahun, note
data_base64 (foto dalam format base64)
created_at
```

---

## **🔌 API Endpoints**

### **Arsiparis**
- `GET /api/arsiparis` — Ambil semua arsiparis
- `POST /api/arsiparis` — Tambah arsiparis baru
- `PUT /api/arsiparis/:id` — Update arsiparis
- `DELETE /api/arsiparis/:id` — Hapus arsiparis

### **Gallery**
- `GET /api/gallery` — Ambil list foto kegiatan
- `GET /api/gallery/:id` — Ambil foto tertentu (base64)
- `POST /api/gallery/upload` — Upload foto kegiatan
- `DELETE /api/gallery/:id` — Hapus foto

### **Eviden**
- `GET /api/eviden` — Ambil list eviden
- `GET /api/eviden/:id` — Ambil eviden tertentu (base64)
- `POST /api/eviden/upload` — Upload eviden
- `DELETE /api/eviden/:id` — Hapus eviden

### **Health Check**
- `GET /api/health` — Test koneksi

---

## **💾 Database File**

Database otomatis dibuat di:
```
dashboard-arsiparis-dap/
└── db/
    └── dashboard.db    ← File database (SQLite)
```

File ini bisa di-backup, di-copy, atau di-restore.

---

## **📝 Contoh Request/Response**

### **POST - Tambah Arsiparis**
```bash
curl -X POST http://localhost:5000/api/arsiparis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "nip": "123456789",
    "golongan": "III",
    "pangkat": "Penata",
    "unit": "Dinas Arsip",
    "kecamatan": "Cibinong",
    "tahun": 2025
  }'
```

Response:
```json
{
  "id": 1,
  "name": "Budi Santoso",
  "nip": "123456789",
  ...
}
```

### **GET - Ambil Semua Arsiparis**
```bash
curl http://localhost:5000/api/arsiparis
```

Response:
```json
[
  {
    "id": 1,
    "name": "Budi Santoso",
    "nip": "123456789",
    ...
  }
]
```

---

## **🔄 Sinkronisasi Frontend-Backend**

Setelah database jalan, update `assets/js/app.js` untuk gunakan API:

```javascript
const API_BASE = 'http://localhost:5000';

// Upload foto kegiatan
async function uploadGalleryPhoto(file, caption) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const response = await fetch(`${API_BASE}/api/gallery/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataURL: e.target.result,
        caption: caption
      })
    });
    const data = await response.json();
    console.log('Upload success:', data);
  };
  reader.readAsDataURL(file);
}

// Load gallery dari database
async function loadGalleryPhotos() {
  const response = await fetch(`${API_BASE}/api/gallery`);
  const photos = await response.json();
  return photos;
}
```

---

## **🐛 Troubleshooting**

| Error | Solusi |
|-------|--------|
| "npm: command not found" | Install Node.js: https://nodejs.org/ |
| "Cannot find module 'better-sqlite3'" | Jalankan: `npm install` |
| "Port 5000 already in use" | Ubah PORT di server.js atau kill process |
| "Database locked" | Restart server, pastikan tidak ada yang akses DB |
| CORS error di browser | Normal, API sudah include CORS header |

---

## **✨ Keuntungan Setup Ini**

✅ **Super mudah** — cukup `npm install` + `npm start`  
✅ **Tidak perlu install program** — semua via npm  
✅ **Database otomatis** — tables dibuat saat startup  
✅ **Base64 storage** — foto disimpan direct di database  
✅ **Persisten** — data tersimpan sampai didelete  
✅ **Portable** — folder `db/` bisa di-copy ke mana saja  
✅ **Ready deploy** — siap push ke Railway/Heroku  

---

## **🚀 Deploy ke Cloud**

Setelah test lokal, deploy ke Railway:

1. Push ke GitHub
2. Buka Railway.app
3. Connect repository
4. Railway otomatis detect Node.js
5. Deploy!

Database akan otomatis dibuat di cloud. Data tersimpan persisten.

---

## **📚 File Penting**

- `server.js` — Main server (database logic di sini)
- `package.json` — Dependencies list
- `db/dashboard.db` — Database file (auto-created)

---

**Selesai setup!** 🎉 

Database Anda siap digunakan. Sekarang update frontend untuk gunakan API.
