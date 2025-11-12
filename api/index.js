/**
 * Vercel Serverless Function Handler
 * Using in-memory storage for now (simple solution)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// In-memory storage (alternative: bisa pakai file JSON)
let arsiparis = [];
let gallery = [];
let eviden = [];
let arsiparisId = 1;
let galleryId = 1;
let evidenId = 1;

// API Routes - Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', storage: 'in-memory' });
});

// ===== ARSIPARIS CRUD =====
app.get('/api/arsiparis', (req, res) => {
  try {
    res.json(arsiparis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/arsiparis', (req, res) => {
  try {
    const newItem = { id: arsiparisId++, ...req.body, created_at: new Date() };
    arsiparis.push(newItem);
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/arsiparis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = arsiparis.findIndex(item => item.id == id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    arsiparis[index] = { ...arsiparis[index], ...req.body, updated_at: new Date() };
    res.json(arsiparis[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/arsiparis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = arsiparis.findIndex(item => item.id == id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    const deleted = arsiparis.splice(index, 1);
    res.json({ success: true, deleted: deleted[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GALLERY CRUD =====
app.get('/api/gallery', (req, res) => {
  try {
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery', (req, res) => {
  try {
    const newItem = { id: galleryId++, ...req.body, created_at: new Date() };
    gallery.push(newItem);
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = gallery.findIndex(item => item.id == id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    gallery.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EVIDEN CRUD =====
app.get('/api/eviden', (req, res) => {
  try {
    res.json(eviden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/eviden', (req, res) => {
  try {
    const newItem = { id: evidenId++, ...req.body, created_at: new Date() };
    eviden.push(newItem);
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/eviden/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = eviden.findIndex(item => item.id == id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    eviden.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all for SPA (serve index.html for unknown routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
