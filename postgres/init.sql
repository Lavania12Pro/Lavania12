-- init.sql: create tables for Dashboard Arsiparis DAP PostgreSQL

CREATE TABLE IF NOT EXISTS arsiparis (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nip TEXT,
  golongan TEXT,
  pangkat TEXT,
  unit TEXT,
  kecamatan TEXT,
  tahun INTEGER,
  nilai_pengawasan JSONB,
  nilai_skpd JSONB,
  catatan TEXT,
  rekomendasi TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  caption TEXT,
  url TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eviden (
  id SERIAL PRIMARY KEY,
  kecamatan TEXT,
  unit TEXT,
  tahun INTEGER,
  note TEXT,
  url TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create a lightweight index
CREATE INDEX IF NOT EXISTS idx_arsiparis_tahun ON arsiparis(tahun);
