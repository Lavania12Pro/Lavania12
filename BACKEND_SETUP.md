# Backend Setup — Dashboard Arsiparis DAP

Panduan lengkap untuk setup backend Express + SQLite dan deploy online.

---

## **OPSI A: Quick Deploy ke Railway.app (Rekomendasi — 5 Menit)**

Railway adalah platform seperti Heroku tapi lebih mudah dan gratis tier lebih besar.

### Langkah:

1. **Setup folder backend:**
   ```bash
   cd d:/ASKI/dashboard-arsiparis-dap
   mkdir backend
   cd backend
   npm init -y
   npm install express cors multer body-parser better-sqlite3
   ```

2. **Copy file `backend-server.js` ke folder `backend/`:**
   ```bash
   cp ../backend-server.js ./server.js
   ```

3. **Buat `package.json` dengan isi:**
   ```json
   {
     "name": "dashboard-arsiparis-backend",
     "version": "1.0.0",
     "main": "server.js",
     "scripts": {
       "start": "node server.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "multer": "^1.4.5",
       "body-parser": "^1.20.2",
       "better-sqlite3": "^9.0.0"
     }
   }
   ```

4. **Push ke GitHub:**
   ```bash
   cd ..
   git add .
   git commit -m "Add backend"
   git push
   ```

5. **Deploy ke Railway:**
   - Buka https://railway.app
   - Login dengan GitHub account
   - Klik "New Project"
   - Pilih repository Anda
   - Railway otomatis detect Node.js
   - Klik "Deploy"
   - Tunggu selesai, dapatkan URL publik

**Selesai!** Backend sudah online. URL akan terlihat seperti: `https://dashboard-arsiparis-backend.railway.app`

---

## **OPSI B: Setup Lokal + Test**

Jalankan backend di laptop Anda untuk testing sebelum deploy ke cloud.

### Langkah:

1. **Install Node.js** (jika belum) → https://nodejs.org/

2. **Setup backend folder:**
   ```bash
   cd d:/ASKI/dashboard-arsiparis-dap
   mkdir backend
   cd backend
   npm init -y
   npm install express cors multer body-parser better-sqlite3
   ```

3. **Copy `backend-server.js` ke folder `backend/` sebagai `server.js`**

4. **Jalankan server:**
   ```bash
   npm start
   ```

   Output:
   ```
   ✓ Dashboard Arsiparis Backend running on port 5000
   ✓ Frontend: http://localhost:5000
   ```

5. **Test di browser:**
   - Frontend: http://localhost:5000
   - API Test: http://localhost:5000/api/gallery

---

## **OPSI C: Docker Deployment**

Untuk deployment yang consistent di berbagai environment.

### Setup:

1. **Buat `Dockerfile` di folder backend:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build image:**
   ```bash
   docker build -t dashboard-arsiparis-backend .
   ```

3. **Run container:**
   ```bash
   docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads dashboard-arsiparis-backend
   ```

---

## **API Endpoints Reference**

Backend menyediakan API berikut:

### Gallery
- `GET /api/gallery` — List semua foto
- `POST /api/gallery/upload` — Upload foto (multipart/form-data)
- `DELETE /api/gallery/:id` — Hapus foto

### Arsiparis
- `GET /api/arsiparis` — List arsiparis
- `POST /api/arsiparis` — Tambah arsiparis
- `PUT /api/arsiparis/:id` — Update arsiparis
- `DELETE /api/arsiparis/:id` — Hapus arsiparis

### Eviden
- `GET /api/eviden` — List eviden
- `POST /api/eviden/upload` — Upload eviden
- `DELETE /api/eviden/:id` — Hapus eviden

---

## **Update Frontend untuk Gunakan Backend**

Setelah backend online, update `assets/js/app.js` agar gunakan API:

```javascript
// Ganti upload lokal dengan POST ke backend
const API_BASE = 'https://YOUR-RAILWAY-URL'; // atau http://localhost:5000 untuk lokal

// Upload gallery
const uploadFile = async (file, caption) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('caption', caption);
  
  const res = await fetch(`${API_BASE}/api/gallery/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
};

// Load gallery dari server
const loadGalleryFromServer = async () => {
  const res = await fetch(`${API_BASE}/api/gallery`);
  return res.json();
};
```

---

## **Troubleshooting**

| Error | Solusi |
|-------|--------|
| "Module not found" | Jalankan `npm install` |
| "Port already in use" | Ubah port di `server.js` atau kill process |
| "Database error" | Pastikan folder `uploads/` bisa ditulis |
| Upload gagal 413 | Naikkan `limit` di `multer` config |

---

## **Next: Integrasi dengan Frontend**

Setelah backend jalan:
1. Update `assets/js/app.js` untuk gunakan `/api/*` endpoints
2. Ubah gallery upload dari localStorage → POST ke API
3. Ubah arsiparis load dari JSON file → GET dari API
4. Test end-to-end

Mau saya update frontend code untuk integrasi dengan backend?
