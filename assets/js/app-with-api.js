/**
 * app-with-api.js — Versi Frontend yang Gunakan Backend API
 * 
 * Cara pakai:
 * 1. Jalankan server: npm start
 * 2. Di index.html, ganti: <script src="assets/js/app.js"></script>
 *    dengan: <script src="assets/js/app-with-api.js"></script>
 * 3. Refresh browser
 * 
 * Data sekarang tersimpan di database, bukan localStorage!
 */

// Auto-detect API_BASE — gunakan current domain di production
const API_BASE = window.location.origin;

// ============ UTILITY ============
function isAdmin() { return !!localStorage.getItem('dap_admin'); }

async function apiCall(method, endpoint, data = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) opts.body = JSON.stringify(data);
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// ============ CAROUSEL ============
(function(){
  const carousel = document.getElementById('carousel');
  if (!carousel) return;
  
  const slides = carousel.children;
  let idx = 0;
  
  function show(i){
    carousel.style.transform = `translateX(-${i*100}%)`;
  }
  
  document.getElementById('prev')?.addEventListener('click', () => {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  });
  
  document.getElementById('next')?.addEventListener('click', () => {
    idx = (idx + 1) % slides.length;
    show(idx);
  });
  
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 4500);
})();

// ============ DATA LOAD & SEARCH ============
let DATA = null;

async function loadData() {
  try {
    // Ambil data dari API
    DATA = await apiCall('GET', '/api/arsiparis');
    if (!Array.isArray(DATA)) DATA = [];
    
    renderAll();
  } catch (err) {
    console.warn('Gagal load data:', err);
    DATA = [];
    const sr = document.getElementById('searchResults');
    if (sr) sr.innerText = 'Error loading data. Server tidak ada?';
  }
}

function renderAll() {
  renderPKPKT();
  renderASKI();
  renderMONEV();
}

function renderPKPKT() {
  const container = document.getElementById('pkpktTable');
  if (!container) return;
  
  const years = ['2023', '2024', '2025', '2026'];
  const sums = { '2023': 0, '2024': 0, '2025': 0, '2026': 0 };
  const counts = { '2023': 0, '2024': 0, '2025': 0, '2026': 0 };
  
  DATA.forEach(a => {
    years.forEach(y => {
      try {
        const val = a.nilai_pengawasan ? JSON.parse(a.nilai_pengawasan)[y] : 0;
        if (val) { sums[y] += val; counts[y]++; }
      } catch (e) {}
    });
  });
  
  let html = '<table class="table"><thead><tr><th>Tahun</th><th>Rata-rata Nilai Pengawasan</th></tr></thead><tbody>';
  years.forEach(y => {
    const avg = counts[y] ? (sums[y] / counts[y]).toFixed(1) : '-';
    html += `<tr><td>${y}</td><td>${avg}</td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderASKI() {
  const container = document.getElementById('askiTable');
  if (!container) return;
  
  const byYear = {};
  DATA.forEach(a => {
    const y = a.tahun || 'Umum';
    byYear[y] = byYear[y] || [];
    byYear[y].push(a);
  });
  
  let html = '';
  Object.keys(byYear).sort().forEach(y => {
    html += `<h4>${y}</h4><ul>`;
    byYear[y].forEach(a => {
      html += `<li>${a.name} — ${a.unit || '-'} ${a.kecamatan ? '/ ' + a.kecamatan : ''}</li>`;
    });
    html += '</ul>';
  });
  
  container.innerHTML = html;
}

function renderMONEV() {
  const container = document.getElementById('monevTable');
  if (!container) return;
  
  let html = '<table class="table"><thead><tr><th>Tahun</th><th>Unit</th><th>Nilai SKPD</th><th>Catatan</th><th>Rekomendasi</th></tr></thead><tbody>';
  
  DATA.forEach(a => {
    try {
      const vals = a.nilai_skpd ? JSON.parse(a.nilai_skpd) : {};
      Object.keys(vals).forEach(y => {
        html += `<tr><td>${y}</td><td>${a.unit} / ${a.kecamatan}</td><td>${vals[y]}</td><td>${a.catatan || '-'}</td><td>${a.rekomendasi || '-'}</td></tr>`;
      });
    } catch (e) {}
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Search
document.getElementById('searchBtn')?.addEventListener('click', doSearch);
document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const target = document.getElementById('searchResults');
  if (!target) return;
  
  if (!DATA) { target.innerText = 'Data belum dimuat.'; return; }
  if (!q) { target.innerText = 'Masukkan nama untuk mencari.'; return; }
  
  const found = DATA.filter(a => a.name.toLowerCase().includes(q));
  if (found.length === 0) {
    target.innerHTML = `<div>Tidak ditemukan hasil untuk "${q}"</div>`;
    return;
  }
  
  let html = '<div class="found-list">';
  found.forEach(a => {
    html += `<div class="card">
      <strong>${a.name}</strong> — ${a.unit} / ${a.kecamatan}
      <br>Tahun: ${a.tahun}
      <br>Nilai Pengawasan: ${a.nilai_pengawasan || '-'}
      <br>Nilai SKPD: ${a.nilai_skpd || '-'}
      <br>Catatan: ${a.catatan || '-'}
      <br>Rekomendasi: ${a.rekomendasi || '-'}
    </div><hr>`;
  });
  html += '</div>';
  target.innerHTML = html;
}

loadData();

// ============ AUTH / LOGIN ============
(function(){
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const cancelLogin = document.getElementById('cancelLogin');
  const doLogin = document.getElementById('doLogin');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginMsg = document.getElementById('loginMsg');
  const adminInfo = document.getElementById('adminInfo');
  const adminName = document.getElementById('adminName');
  const logoutBtn = document.getElementById('logoutBtn');

  function openModal() {
    if (loginModal) loginModal.style.display = 'flex';
    if (loginMsg) loginMsg.innerText = '';
    if (loginUser) loginUser.value = '';
    if (loginPass) loginPass.value = '';
    loginUser?.focus();
  }

  function closeModal() { if (loginModal) loginModal.style.display = 'none'; }

  loginBtn?.addEventListener('click', openModal);
  cancelLogin?.addEventListener('click', closeModal);

  function setAdmin(name) {
    localStorage.setItem('dap_admin', name);
    updateAdminUI();
  }

  function clearAdmin() {
    localStorage.removeItem('dap_admin');
    updateAdminUI();
  }

  function updateAdminUI() {
    const name = localStorage.getItem('dap_admin');
    if (name) {
      if (adminInfo) adminInfo.style.display = 'flex';
      if (adminName) adminName.innerText = 'Admin: ' + name;
      if (loginBtn) loginBtn.style.display = 'none';
    } else {
      if (adminInfo) adminInfo.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'inline-block';
    }
  }

  doLogin?.addEventListener('click', () => {
    const u = loginUser.value.trim();
    const p = loginPass.value;
    if (!u || !p) { if (loginMsg) loginMsg.innerText = 'Masukkan username & password.'; return; }
    if (u === 'admin' && p === 'admin123') {
      setAdmin('admin');
      closeModal();
    } else {
      if (loginMsg) loginMsg.innerText = 'Kredensial salah.';
    }
  });

  logoutBtn?.addEventListener('click', () => { clearAdmin(); });

  updateAdminUI();
})();

// ============ GALLERY (FOTO KEGIATAN) ============
(function(){
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryPanel = document.getElementById('galleryPanel');
  const galleryFile = document.getElementById('galleryFile');
  const galleryCaption = document.getElementById('galleryCaption');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const galleryPreview = document.getElementById('galleryPreview');

  async function renderGallery() {
    if (!galleryGrid) return;
    try {
      const photos = await apiCall('GET', '/api/gallery');
      galleryGrid.innerHTML = '';
      
      if (!photos.length) {
        galleryGrid.innerHTML = '<div>Tidak ada foto kegiatan.</div>';
        return;
      }
      
      for (const photo of photos) {
        const photoData = await apiCall('GET', `/api/gallery/${photo.id}`);
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `<img src="${photoData.data}" alt="foto"><div class="photo-meta"><div class="caption">${photo.caption || ''}</div><div class="meta-date">${new Date(photo.created_at).toLocaleString()}</div></div>`;
        
        const actions = document.createElement('div');
        actions.className = 'photo-actions';
        const dl = document.createElement('a');
        dl.href = photoData.data;
        dl.download = `foto_${photo.id}.jpg`;
        dl.innerText = 'Download';
        dl.className = 'btn-small';
        actions.appendChild(dl);
        
        if (isAdmin()) {
          const del = document.createElement('button');
          del.innerText = 'Hapus';
          del.className = 'btn-small btn-danger';
          del.addEventListener('click', async () => {
            if (confirm('Hapus foto ini?')) {
              await apiCall('DELETE', `/api/gallery/${photo.id}`);
              renderGallery();
            }
          });
          actions.appendChild(del);
        }
        
        card.appendChild(actions);
        galleryGrid.appendChild(card);
      }
    } catch (err) {
      console.error('Error rendering gallery:', err);
      if (galleryGrid) galleryGrid.innerHTML = '<div>Error loading gallery.</div>';
    }
  }

  if (galleryFile) {
    galleryFile.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (galleryPreview) {
        galleryPreview.innerHTML = '';
        files.slice(0, 6).forEach(f => {
          const r = new FileReader();
          r.onload = (ev) => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.className = 'preview-thumb';
            galleryPreview.appendChild(img);
          };
          r.readAsDataURL(f);
        });
      }
    });
  }

  if (saveGalleryBtn) {
    saveGalleryBtn.addEventListener('click', async () => {
      if (!isAdmin()) { alert('Hanya admin yang dapat mengunggah foto.'); return; }
      
      const files = Array.from(galleryFile.files || []);
      const caption = galleryCaption.value.trim();
      
      if (!files.length) { alert('Pilih minimal satu foto.'); return; }
      
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            await apiCall('POST', '/api/gallery/upload', {
              dataURL: ev.target.result,
              caption: caption
            });
          } catch (err) {
            alert('Upload gagal: ' + err.message);
          }
        };
        reader.readAsDataURL(file);
      }
      
      galleryFile.value = '';
      galleryCaption.value = '';
      if (galleryPreview) galleryPreview.innerHTML = '';
      renderGallery();
    });
  }

  function updateGalleryPanel() {
    if (galleryPanel) galleryPanel.style.display = isAdmin() ? 'block' : 'none';
    renderGallery();
  }

  updateGalleryPanel();
  window.addEventListener('storage', updateGalleryPanel);
})();

// ============ EVIDEN (ASKI) ============
(function(){
  const panel = document.getElementById('evidenPanel');
  const fileInput = document.getElementById('evidenFile');
  const saveBtn = document.getElementById('saveEviden');
  const list = document.getElementById('evidenList');
  const kecInput = document.getElementById('evidenKecamatan');
  const unitInput = document.getElementById('evidenUnit');
  const tahunInput = document.getElementById('evidenTahun');
  const noteInput = document.getElementById('evidenNote');

  async function renderList() {
    if (!list) return;
    try {
      const eviden = await apiCall('GET', '/api/eviden');
      list.innerHTML = '';
      
      if (!eviden.length) { list.innerHTML = '<div>Tidak ada eviden.</div>'; return; }
      
      for (const item of eviden) {
        const itemData = await apiCall('GET', `/api/eviden/${item.id}`);
        const div = document.createElement('div');
        div.className = 'eviden-item';
        div.innerHTML = `<img src="${itemData.data}" alt="eviden"><div class="eviden-meta"><strong>${item.unit}</strong><br>${item.kecamatan} — ${item.tahun}<br>${item.note || ''}</div>`;
        
        const actions = document.createElement('div');
        actions.className = 'eviden-actions';
        const dl = document.createElement('a');
        dl.href = itemData.data;
        dl.download = `eviden_${item.id}.jpg`;
        dl.innerText = 'Download';
        dl.className = 'download';
        actions.appendChild(dl);
        
        if (isAdmin()) {
          const del = document.createElement('button');
          del.innerText = 'Hapus';
          del.className = 'del';
          del.addEventListener('click', async () => {
            if (confirm('Hapus eviden ini?')) {
              await apiCall('DELETE', `/api/eviden/${item.id}`);
              renderList();
            }
          });
          actions.appendChild(del);
        }
        
        div.appendChild(actions);
        list.appendChild(div);
      }
    } catch (err) {
      console.error('Error rendering eviden:', err);
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!isAdmin()) { alert('Hanya admin yang bisa mengunggah eviden.'); return; }
      
      const file = fileInput.files[0];
      const kec = kecInput.value.trim();
      const unit = unitInput.value.trim();
      const tahun = tahunInput.value;
      const note = noteInput.value.trim();
      
      if (!file || !kec || !unit || !tahun) {
        alert('Isi kecamatan, unit, tahun dan pilih foto.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await apiCall('POST', '/api/eviden/upload', {
            dataURL: ev.target.result,
            kecamatan: kec,
            unit: unit,
            tahun: tahun,
            note: note
          });
          fileInput.value = '';
          kecInput.value = '';
          unitInput.value = '';
          noteInput.value = '';
          renderList();
          alert('Eviden tersimpan.');
        } catch (err) {
          alert('Upload gagal: ' + err.message);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function updatePanel() {
    if (panel) panel.style.display = isAdmin() ? 'block' : 'none';
    renderList();
  }

  updatePanel();
  window.addEventListener('storage', updatePanel);
})();
