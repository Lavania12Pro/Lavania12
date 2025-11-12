# Postgres Server Setup (Docker + Node)

Instruksi untuk menjalankan PostgreSQL dan backend Node yang terhubung.

Prereq:
- Docker & Docker Compose terinstall (https://docs.docker.com/get-docker/)
- Node.js (untuk menjalankan backend Node)

1) Jalankan Postgres via Docker Compose
```powershell
cd d:/ASKI/dashboard-arsiparis-dap
docker compose -f docker-compose.postgres.yml up -d
```
Ini akan membuat container Postgres dengan:
- user: `dapuser`
- password: `dapsecret`
- db: `dapdb`
- port: `5432` pada host

2) Cek logs dan pastikan init.sql sudah dijalankan
```powershell
docker compose -f docker-compose.postgres.yml logs -f
```

3) Jalankan backend Node (postgres-server)
```powershell
cd d:/ASKI/dashboard-arsiparis-dap/postgres-server
# copy .env.example to .env and edit jika diperlukan
cp .env.example .env
npm install
npm start
```
Server akan berjalan pada default port `5001`. Frontend dapat di-serve oleh server ini atau anda dapat tetap pakai static server.

4) Ubah `assets/js/app-with-api.js` (atau `app.js`) untuk mengarah ke API_BASE `http://localhost:5001` jika diperlukan.

---

Notes:
- Docker init script `postgres/init.sql` membuat tabel yang dibutuhkan.
- Untuk production gunakan managed Postgres (e.g. Railway/Postgres, Heroku Postgres, AWS RDS).
