#!/bin/bash
# Setup script untuk backend Express
# Jalankan: bash setup-backend.sh

mkdir -p backend
cd backend

# Init Node project
npm init -y

# Install dependencies
npm install express cors multer body-parser better-sqlite3 dotenv

echo "✓ Backend folder created di ./backend"
echo "✓ Dependencies installed"
echo ""
echo "Next steps:"
echo "1. Copy file server.js dari sini ke ./backend/"
echo "2. Run: npm start"
echo "3. Test: curl http://localhost:5000"
