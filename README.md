# Dashboard Arsiparis DAP (Prototype)

Aplikasi web sederhana untuk menampilkan nilai pengawasan (PKPKT), data arsiparis (ASKI), nilai SKPD (MONEV), serta catatan dan rekomendasi.

Struktur proyek:

- index.html — halaman utama
- assets/css/style.css — styling
- assets/js/app.js — fungsi carousel, data load, search, dan render
- assets/img/* — placeholder images
- data/arsiparis.json — sample data

Cara menjalankan (opsi sederhana):

1) Buka langsung (risiko: browser memblokir fetch dari file://). Jika terjadi error ketika memuat `data/arsiparis.json`, jalankan server lokal.

2) Jalankan server HTTP sederhana (PowerShell / Windows):

```powershell
# Dengan Python 3
cd d:/ASKI/dashboard-arsiparis-dap
python -m http.server 8000
# lalu buka http://localhost:8000
```

Atau jika menggunakan Node.js dan http-server:

```powershell
npm install -g http-server
cd d:/ASKI/dashboard-arsiparis-dap
http-server -p 8000
```

Pengembangan lanjut:
- Migrasi ke Flask atau Express untuk API dan manajemen data
- Tambah pagination, filter, dan ekspor (CSV/PDF)
- Tambah autentikasi dan role-based access
