# Panduan Deployment Dashboard Arsiparis DAP — Online

Berikut adalah **5 opsi deployment** untuk menjalankan web ini secara online dengan mudah. Pilih sesuai kebutuhan Anda.

---

## **Opsi 1: GitHub Pages (PALING MUDAH — Gratis, tanpa backend)**

**Cocok untuk:** Prototype, data statis, tidak butuh upload ke server.

### Langkah-langkah:
1. **Buat akun GitHub** (jika belum) → https://github.com/signup
2. **Buat repository baru** dengan nama `dashboard-arsiparis-dap`
3. **Clone atau push folder proyek ke repo:**
   ```bash
   cd d:/ASKI/dashboard-arsiparis-dap
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/dashboard-arsiparis-dap.git
   git push -u origin main
   ```
4. **Aktifkan GitHub Pages** di repo settings:
   - Buka Settings → Pages
   - Pilih "Source: main branch"
   - Tunggu beberapa menit
5. **Akses online:** `https://USERNAME.github.io/dashboard-arsiparis-dap`

**Keuntungan:**
- Gratis, tidak perlu server
- Deploy cukup push ke git
- Mudah untuk team collab

**Keterbatasan:**
- Data hanya di localStorage (tidak persisten antar-device)
- Tidak bisa upload file ke server (upload hanya disimpan di browser lokal)
- Tidak bisa punya backend custom

---

## **Opsi 2: Netlify (MUDAH — Gratis, auto-deploy dari Git)**

**Cocok untuk:** Static site dengan auto-deploy, preview URLs.

### Langkah-langkah:
1. **Push ke GitHub** (ikuti Opsi 1 dulu)
2. **Daftar di Netlify** → https://app.netlify.com (bisa via GitHub account)
3. **Connect repository:**
   - Klik "Add new site" → "Import an existing project"
   - Pilih repository Anda
   - Build settings: kosongkan (sudah static)
   - Deploy!
4. **Akses:** Netlify akan beri URL seperti `https://RANDOM-NAME.netlify.app`

**Keuntungan:**
- Deploy otomatis saat push ke Git
- Custom domain bisa ditambah
- Preview URLs untuk test

**Keterbatasan:**
- Sama seperti GitHub Pages (data lokal saja)
- Tidak ada backend

---

## **Opsi 3: Railway.app (MUDAH — Gratis, punya backend option)**

**Cocok untuk:** Mau punya backend sederhana (Node.js + Express + Database).

### Setup Backend (Express + SQLite) + Frontend Deploy:

#### A. Setup Express Backend:
1. **Buat folder baru untuk backend:**
   ```bash
   mkdir dashboard-arsiparis-backend
   cd dashboard-arsiparis-backend
   npm init -y
   npm install express cors multer body-parser better-sqlite3
   ```

2. **Buat `server.js`:**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const multer = require('multer');
   const path = require('path');
   const fs = require('fs');

   const app = express();
   const upload = multer({ dest: 'uploads/' });

   app.use(cors());
   app.use(express.json({ limit: '50mb' }));
   app.use(express.static('../dashboard-arsiparis-dap')); // Serve frontend

   // Contoh endpoint: upload foto
   app.post('/api/gallery/upload', upload.single('photo'), (req, res) => {
     if (!req.file) return res.status(400).json({ error: 'No file' });
     res.json({ 
       id: Date.now(), 
       url: `/uploads/${req.file.filename}`,
       caption: req.body.caption 
     });
   });

   // Endpoint: ambil daftar gallery
   app.get('/api/gallery', (req, res) => {
     const files = fs.readdirSync('uploads/').map(f => ({
       id: f, 
       url: `/uploads/${f}`
     }));
     res.json(files);
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server on port ${PORT}`));
   ```

3. **Test lokal:**
   ```bash
   npm start
   ```

#### B. Deploy ke Railway:
1. **Daftar di Railway** → https://railway.app
2. **Connect GitHub repository** dengan backend
3. **Tambah environment variables** di Railway dashboard
4. **Deploy otomatis**

**Keuntungan:**
- Backend tersimpan di server (data persisten)
- File upload tersimpan di server
- Scalable

**Keterbatasan:**
- Perlu setup Node.js
- Gratis Railway punya batas resource

---

## **Opsi 4: Heroku (Gratis dengan card credit, Backend + Database)**

**Cocok untuk:** Production-ready dengan PostgreSQL/MongoDB.

### Langkah:
1. **Daftar di Heroku** → https://www.heroku.com/
2. **Install Heroku CLI**
3. **Setup backend Express + DB:**
   ```bash
   npm install pg dotenv
   ```
4. **Buat `Procfile`:**
   ```
   web: node server.js
   ```
5. **Deploy:**
   ```bash
   heroku login
   heroku create app-name
   git push heroku main
   ```

**Keuntungan:**
- Production-ready
- PostgreSQL database included
- Custom domain

**Keterbatasan:**
- Heroku sekarang mostly paid (gratis tier dihapus Nov 2022)
- Setup lebih kompleks

---

## **Opsi 5: Docker + VPS (Paling Fleksibel, Full Control)**

**Cocok untuk:** Enterprise, full control, ingin host sendiri.

### Langkah Singkat:

#### A. Setup Docker:
1. **Buat `Dockerfile`:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Buat `docker-compose.yml`:**
   ```yaml
   version: '3'
   services:
     web:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
   ```

3. **Build & run:**
   ```bash
   docker build -t dashboard-app .
   docker run -p 5000:5000 dashboard-app
   ```

#### B. Deploy ke VPS (DigitalOcean, AWS, Linode):
1. **Rent VPS** (start dari $5/bulan)
2. **Install Docker** di VPS
3. **Push image** ke Docker Hub
4. **Pull dan run** di VPS
5. **Setup Nginx** sebagai reverse proxy
6. **Setup SSL** (Let's Encrypt gratis)

**Keuntungan:**
- Full control
- Scalable unlimited
- Custom setup

**Keterbatasan:**
- Setup kompleks
- Ada biaya hosting ($5-20/bulan)

---

## **REKOMENDASI (Pilih salah satu):**

| Kebutuhan | Opsi | Alasan |
|-----------|------|--------|
| **Cepat & Gratis, test saja** | GitHub Pages / Netlify | Setup 10 menit, gratis |
| **Ingin punya backend sederhana** | Railway.app | Gratis tier cukup, setup mudah |
| **Production ready dengan DB** | Heroku atau VPS | Stabil, scalable |
| **Full control, enterprise** | Docker + VPS | Unlimited, custom |

---

## **NEXT STEPS (Sesudah Deploy):**

1. **Gunakan backend untuk:**
   - Simpan foto upload ke server (bukan localStorage)
   - Simpan data arsiparis ke database
   - Autentikasi user (bukan client-side)

2. **Update frontend:**
   - Ubah upload dari localStorage → POST ke `/api/gallery/upload`
   - Ubah search dari JSON → GET dari `/api/arsiparis`

3. **SSL/HTTPS:**
   - Semua opsi di atas support HTTPS gratis

---

## **Quick Start Recommendation:**

**Untuk mulai sekarang (dalam 15 menit):**

```bash
# 1. Push ke GitHub
cd d:/ASKI/dashboard-arsiparis-dap
git add .
git commit -m "Dashboard ready for deploy"
git push

# 2. Deploy ke Netlify (klik tombol di situs Netlify)
# Selesai! Website sudah online
```

Mau saya bantu setup salah satu opsi?
