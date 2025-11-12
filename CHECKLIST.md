# CHECKLIST DEPLOYMENT ONLINE

Pilih satu cara dan ikuti checklist di bawah.

---

## **✅ OPSI 1: GitHub Pages (Paling Mudah)**

Waktu: ~15 menit | Biaya: GRATIS | Backend: Tidak

- [ ] Buat akun GitHub (https://github.com/signup)
- [ ] Install Git (https://git-scm.com/download/win)
- [ ] Buka PowerShell, masuk ke folder proyek:
  ```powershell
  cd "d:/ASKI/dashboard-arsiparis-dap"
  ```
- [ ] Init Git repo:
  ```powershell
  git init
  git add .
  git commit -m "Dashboard Arsiparis DAP"
  ```
- [ ] Buat repository baru di GitHub.com dengan nama `dashboard-arsiparis-dap`
- [ ] Push ke GitHub:
  ```powershell
  git remote add origin https://github.com/YOUR_USERNAME/dashboard-arsiparis-dap.git
  git branch -M main
  git push -u origin main
  ```
- [ ] Buka GitHub repo Settings → Pages
- [ ] Set Source: main branch → Save
- [ ] Tunggu 1-2 menit
- [ ] Akses: `https://YOUR_USERNAME.github.io/dashboard-arsiparis-dap` ✅

---

## **✅ OPSI 2: Netlify (Auto Deploy)**

Waktu: ~10 menit | Biaya: GRATIS | Backend: Tidak

- [ ] Push ke GitHub dulu (ikuti Opsi 1)
- [ ] Daftar Netlify: https://app.netlify.com (via GitHub)
- [ ] Klik "Add new site" → "Import an existing project"
- [ ] Pilih repository `dashboard-arsiparis-dap`
- [ ] Deploy! Tunggu selesai (~1 menit)
- [ ] Klik URL yang diberikan Netlify ✅
- [ ] Bonus: saat ada update, push ke Git → auto-deploy

---

## **✅ OPSI 3: Railway.app (Dengan Backend)**

Waktu: ~20 menit | Biaya: GRATIS tier | Backend: ✅ YA

### A. Setup Backend:
- [ ] Install Node.js: https://nodejs.org/ (download LTS)
- [ ] Buka PowerShell, masuk folder proyek:
  ```powershell
  cd "d:/ASKI/dashboard-arsiparis-dap"
  ```
- [ ] Buat folder backend:
  ```powershell
  mkdir backend
  cd backend
  npm init -y
  ```
- [ ] Install dependencies:
  ```powershell
  npm install express cors multer body-parser better-sqlite3
  ```
- [ ] Copy file `backend-server.js` dari proyek root ke folder `backend/` dengan nama `server.js`
- [ ] Edit `backend/package.json`, tambahkan di scripts:
  ```json
  "scripts": {
    "start": "node server.js"
  }
  ```
- [ ] Test lokal (opsional):
  ```powershell
  npm start
  ```
  Kunjungi: http://localhost:5000
- [ ] Kembali ke folder root:
  ```powershell
  cd ..
  ```
- [ ] Commit ke Git:
  ```powershell
  git add .
  git commit -m "Add backend"
  git push
  ```

### B. Deploy ke Railway:
- [ ] Daftar Railway: https://railway.app (via GitHub)
- [ ] Klik "New Project" → "Import from GitHub"
- [ ] Pilih repository
- [ ] Railway otomatis detect Node.js
- [ ] Klik "Deploy" → tunggu (~3 menit)
- [ ] Dapatkan URL publik dari Railway dashboard
- [ ] Test: `https://YOUR_RAILWAY_URL/` ✅
- [ ] Gallery upload sekarang tersimpan di server! 

---

## **📝 Test Setelah Deploy**

Setiap opsi, cek:
- [ ] Frontend muncul: https://your-url/
- [ ] Slideshow berjalan
- [ ] Search berfungsi
- [ ] (Opsi 3 saja) Admin login → Upload foto → tersimpan

---

## **🔧 Troubleshooting**

| Masalah | Solusi |
|--------|--------|
| "Permission denied" saat git push | Buat Personal Access Token di GitHub Settings |
| "git: command not found" | Install Git: https://git-scm.com/ |
| "npm: command not found" | Install Node.js: https://nodejs.org/ |
| Website blank setelah deploy | Buka browser DevTools (F12) lihat console errors |
| Upload foto gagal (Opsi 3) | Cek Railway logs, restart dyno |

---

## **💡 Rekomendasi Personal**

**Untuk mulai cepat:** 
→ **Opsi 1 (GitHub Pages)** — 15 menit, gratis, langsung online

**Untuk production:**
→ **Opsi 3 (Railway.app + Backend)** — 20 menit, gratis tier cukup, dapat file storage

**Untuk team / sering update:**
→ **Opsi 2 (Netlify)** — Auto-deploy, preview URLs, mudah collaborate

---

## **✨ Setelah Online**

1. **Bagikan URL** ke tim/stakeholder
2. **Test** upload foto & search di production
3. **Monitor** error (cek logs di hosting platform)
4. **Update** backend jika butuh fitur baru

---

Pilih salah satu & **mulai sekarang**! 🚀
