// app.js: carousel, data fetch, search and render
(function(){
  const carousel = document.getElementById('carousel');
  const slides = carousel.children;
  let idx = 0;
  function show(i){
    carousel.style.transform = `translateX(-${i*100}%)`;
  }
  document.getElementById('prev').addEventListener('click',()=>{ idx = (idx-1+slides.length)%slides.length; show(idx); });
  document.getElementById('next').addEventListener('click',()=>{ idx = (idx+1)%slides.length; show(idx); });
  setInterval(()=>{ idx=(idx+1)%slides.length; show(idx); },4500);

  // Data load
  let DATA = null;
  async function loadData(){
    try{
      const res = await fetch('data/arsiparis.json');
      DATA = await res.json();
    }catch(err){
      console.warn('Gagal memuat data JSON:', err);
      // ensure DATA exists as object so we can merge local entries
      DATA = { arsiparis: [] };
    }

    // Merge any locally entered arsiparis (from `arsiparis` page stored in localStorage)
    try{
      const local = JSON.parse(localStorage.getItem('dap_arsiparis') || '[]');
      if(Array.isArray(local) && local.length){
        DATA = DATA || { arsiparis: [] };
        const existingIds = new Set(DATA.arsiparis.map(a=>String(a.id)));
        local.forEach(l=>{
          if(!existingIds.has(String(l.id))){
            // push local entry (may have slightly different fields) into main dataset
            DATA.arsiparis.push(l);
          }
        });
      }
    }catch(e){
      console.warn('Tidak dapat membaca local arsiparis:', e);
    }

    // if still no data, show warning in search area
    if(!DATA || !Array.isArray(DATA.arsiparis) || DATA.arsiparis.length===0){
      const sr = document.getElementById('searchResults');
      if(sr) sr.innerText = 'Tidak ada data arsiparis (masukkan data melalui menu Arsiparis).';
    }

    renderAll();
  }

  function renderAll(){
    renderPKPKT();
    renderASKI();
    renderMONEV();
  }

  function renderPKPKT(){
    const container = document.getElementById('pkpktTable');
    // compute average nilai_pengawasan per year
    const years = ['2023','2024','2025','2026'];
    const sums = { '2023':0,'2024':0,'2025':0,'2026':0 };
    const counts = { '2023':0,'2024':0,'2025':0,'2026':0 };
    DATA.arsiparis.forEach(a=>{
      for(const y of years){
        if(a.nilai_pengawasan && a.nilai_pengawasan[y]){ sums[y]+=a.nilai_pengawasan[y]; counts[y]++; }
      }
    });
    let html = '<table class="table"><thead><tr><th>Tahun</th><th>Rata-rata Nilai Pengawasan</th></tr></thead><tbody>';
    years.forEach(y=>{
      const avg = counts[y]? (sums[y]/counts[y]).toFixed(1) : '-';
      html += `<tr><td>${y}</td><td>${avg}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function renderASKI(){
    const container = document.getElementById('askiTable');
    // group arsiparis per tahun (if tahun missing, group as 'Umum')
    const byYear = {};
    (DATA.arsiparis||[]).forEach(a=>{
      const y = a.tahun || 'Umum';
      byYear[y] = byYear[y]||[];
      byYear[y].push(a);
    });
    let html = '';
    const years = Object.keys(byYear).sort();
    years.forEach(y=>{
      html += `<h4>${y}</h4><ul>`;
      byYear[y].forEach(a=>{ html += `<li>${a.name} — ${a.unit||'-'} ${a.kecamatan?'/ '+a.kecamatan:''}</li>`; });
      html += '</ul>';
    });
    container.innerHTML = html;
  }

  function renderMONEV(){
    const container = document.getElementById('monevTable');
    let html = '<table class="table"><thead><tr><th>Tahun</th><th>Unit (PD/Kecamatan)</th><th>Nilai SKPD</th><th>Catatan</th><th>Rekomendasi</th></tr></thead><tbody>';
    // show each record's nilai_skpd per year with notes
    DATA.arsiparis.forEach(a=>{
      const years = Object.keys(a.nilai_skpd||{}).sort();
      years.forEach(y=>{
        html += `<tr><td>${y}</td><td>${a.unit} / ${a.kecamatan}</td><td>${a.nilai_skpd[y]}</td><td>${a.catatan||'-'}</td><td>${a.rekomendasi||'-'}</td></tr>`;
      });
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Search
  document.getElementById('searchBtn').addEventListener('click',doSearch);
  document.getElementById('searchInput').addEventListener('keydown',(e)=>{ if(e.key==='Enter') doSearch(); });
  function doSearch(){
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const target = document.getElementById('searchResults');
    if(!DATA){ target.innerText = 'Data belum dimuat.'; return; }
    if(!q){ target.innerText = 'Masukkan nama untuk mencari.'; return; }
    const found = DATA.arsiparis.filter(a=>a.name.toLowerCase().includes(q));
    if(found.length===0){ target.innerHTML = `<div>Tidak ditemukan hasil untuk "${q}"</div>`; return; }
    let html = '<div class="found-list">';
    found.forEach(a=>{
      html += `<div class="card"><strong>${a.name}</strong> — ${a.unit} / ${a.kecamatan}<br>Tahun: ${a.tahun}<br>Nilai Pengawasan: ${JSON.stringify(a.nilai_pengawasan)}<br>Nilai SKPD: ${JSON.stringify(a.nilai_skpd)}<br>Catatan: ${a.catatan||'-'}<br>Rekomendasi: ${a.rekomendasi||'-'}</div><hr>`;
    });
    html += '</div>';
    target.innerHTML = html;
  }

  loadData();
})();

// Listen for changes to localStorage (e.g., new arsiparis added on arsiparis page) and merge
window.addEventListener('storage', (e)=>{
  if(e.key === 'dap_arsiparis'){
    try{
      const local = JSON.parse(e.newValue || '[]');
      if(Array.isArray(local) && local.length){
        DATA = DATA || { arsiparis: [] };
        const existingIds = new Set(DATA.arsiparis.map(a=>String(a.id)));
        local.forEach(l=>{ if(!existingIds.has(String(l.id))){ DATA.arsiparis.push(l); } });
        renderAll();
      }
    }catch(err){ console.warn('Gagal memproses perubahan local arsiparis', err); }
  }
});

// Auth / login modal handling
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

  function openModal(){ loginModal.style.display='flex'; loginMsg.innerText=''; loginUser.value=''; loginPass.value=''; loginUser.focus(); }
  function closeModal(){ loginModal.style.display='none'; }

  loginBtn && loginBtn.addEventListener('click', openModal);
  cancelLogin && cancelLogin.addEventListener('click', closeModal);

  function setAdmin(name){
    localStorage.setItem('dap_admin', name);
    updateAdminUI();
  }
  function clearAdmin(){
    localStorage.removeItem('dap_admin');
    updateAdminUI();
  }

  function updateAdminUI(){
    const name = localStorage.getItem('dap_admin');
    if(name){
      adminInfo.style.display='flex';
      adminName.innerText = 'Admin: ' + name;
      if(loginBtn) loginBtn.style.display='none';
    } else {
      adminInfo.style.display='none';
      if(loginBtn) loginBtn.style.display='inline-block';
    }
  }

  // sample credentials: admin / admin123
  doLogin && doLogin.addEventListener('click', ()=>{
    const u = loginUser.value.trim();
    const p = loginPass.value;
    if(!u || !p){ loginMsg.innerText = 'Masukkan username & password.'; return; }
    if(u === 'admin' && p === 'admin123'){
      setAdmin('admin');
      closeModal();
    } else {
      loginMsg.innerText = 'Kredensial salah.';
    }
  });

  logoutBtn && logoutBtn.addEventListener('click', ()=>{ clearAdmin(); });

  // init
  updateAdminUI();
})();

// Eviden ASKI handling (visible to admin)
(function(){
  function isAdmin(){ return !!localStorage.getItem('dap_admin'); }
  const panel = document.getElementById('evidenPanel');
  const fileInput = document.getElementById('evidenFile');
  const preview = document.getElementById('evidenPreview');
  const saveBtn = document.getElementById('saveEviden');
  const list = document.getElementById('evidenList');
  const kecInput = document.getElementById('evidenKecamatan');
  const unitInput = document.getElementById('evidenUnit');
  const tahunInput = document.getElementById('evidenTahun');
  const noteInput = document.getElementById('evidenNote');

  function loadEviden(){
    const raw = localStorage.getItem('dap_eviden');
    return raw ? JSON.parse(raw) : [];
  }
  function saveEvidens(arr){ localStorage.setItem('dap_eviden', JSON.stringify(arr)); }

  function renderList(){
    const arr = loadEviden();
    list.innerHTML = '';
    if(arr.length===0){ list.innerHTML = '<div>Tidak ada eviden.</div>'; return; }
    // apply filters
    const fT = document.getElementById('filterTahun')?.value || '';
    const fK = document.getElementById('filterKecamatan')?.value.trim().toLowerCase() || '';
    const fU = document.getElementById('filterUnit')?.value.trim().toLowerCase() || '';
    const filtered = arr.filter(e=>{
      if(fT && String(e.tahun) !== String(fT)) return false;
      if(fK && !String(e.kecamatan).toLowerCase().includes(fK)) return false;
      if(fU && !String(e.unit).toLowerCase().includes(fU)) return false;
      return true;
    });
    if(filtered.length===0){ list.innerHTML = '<div>Tidak ada eviden sesuai filter.</div>'; return; }
    filtered.slice().reverse().forEach(e=>{
      const div = document.createElement('div'); div.className='eviden-item';
      const meta = `<div class="eviden-meta"><strong>${e.unit}</strong><br>${e.kecamatan} — ${e.tahun}<br>${e.note||''}</div>`;
      const actions = `<div class="eviden-actions"><a class="download" href="${e.dataURL}" download="eviden_${e.id}.jpg">Download</a><button class="del" data-id="${e.id}">Hapus</button></div>`;
      div.innerHTML = `<img src="${e.dataURL}" alt="eviden">${meta}${actions}`;
      list.appendChild(div);
    });
    // attach delete handlers (delegation)
    list.querySelectorAll('.del').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        const id = Number(ev.currentTarget.dataset.id);
        if(!confirm('Hapus eviden ini?')) return;
        const all = loadEviden();
        const kept = all.filter(x=>x.id !== id);
        saveEvidens(kept);
        renderList();
      });
    });
  }

  function showPreview(file){
    if(!file) { preview.innerHTML=''; return; }
    const reader = new FileReader();
    reader.onload = function(ev){ preview.innerHTML = `<img src="${ev.target.result}">`; preview.dataset.url = ev.target.result; };
    reader.readAsDataURL(file);
  }

  if(fileInput) fileInput.addEventListener('change', (e)=>{ const f=e.target.files[0]; showPreview(f); });

  if(saveBtn) saveBtn.addEventListener('click', ()=>{
    if(!isAdmin()){ alert('Hanya admin yang bisa mengunggah eviden.'); return; }
    const file = fileInput.files[0];
    const kec = kecInput.value.trim();
    const unit = unitInput.value.trim();
    const tahun = tahunInput.value;
    const note = noteInput.value.trim();
    if(!file || !kec || !unit || !tahun){ alert('Isi kecamatan, unit, tahun dan pilih foto.'); return; }
    const reader = new FileReader();
    reader.onload = function(ev){
      const arr = loadEviden();
      arr.push({ id: Date.now(), kecamatan:kec, unit:unit, tahun:tahun, note:note, dataURL:ev.target.result });
      saveEvidens(arr);
      renderList();
      // clear form
      fileInput.value=''; preview.innerHTML=''; kecInput.value=''; unitInput.value=''; noteInput.value='';
      alert('Eviden tersimpan.');
    };
    reader.readAsDataURL(file);
  });

  // show panel only for admin and render existing
  function updatePanel(){ if(panel){ panel.style.display = isAdmin()? 'block' : 'none'; } renderList(); }
  // filter controls
  const applyFilterBtn = document.getElementById('applyFilter');
  const clearFilterBtn = document.getElementById('clearFilter');
  if(applyFilterBtn) applyFilterBtn.addEventListener('click', ()=>{ renderList(); });
  if(clearFilterBtn) clearFilterBtn.addEventListener('click', ()=>{
    document.getElementById('filterTahun').value = '';
    document.getElementById('filterKecamatan').value = '';
    document.getElementById('filterUnit').value = '';
    renderList();
  });
  // listen for admin changes (localStorage) — primitive
  window.addEventListener('storage', updatePanel);
  updatePanel();
})();

// Foto Kegiatan (gallery) — admin can upload photos; stored in localStorage as `dap_gallery`
(function(){
  function isAdmin(){ return !!localStorage.getItem('dap_admin'); }
  const key = 'dap_gallery';
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryPanel = document.getElementById('galleryPanel');
  const galleryFile = document.getElementById('galleryFile');
  const galleryCaption = document.getElementById('galleryCaption');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const galleryPreview = document.getElementById('galleryPreview');

  function loadGallery(){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function saveGallery(arr){ localStorage.setItem(key, JSON.stringify(arr)); }

  function renderGallery(){
    const arr = loadGallery();
    if(!galleryGrid) return;
    galleryGrid.innerHTML = '';
    if(arr.length===0){ galleryGrid.innerHTML = '<div>Tidak ada foto kegiatan.</div>'; return; }
    arr.slice().reverse().forEach(item=>{
      const card = document.createElement('div'); card.className = 'photo-card';
      card.innerHTML = `<img src="${item.dataURL}" alt="foto"><div class="photo-meta"><div class="caption">${item.caption||''}</div><div class="meta-date">${new Date(item.date).toLocaleString()}</div></div>`;
      const actions = document.createElement('div'); actions.className='photo-actions';
      const dl = document.createElement('a'); dl.href = item.dataURL; dl.download = `foto_${item.id}.jpg`; dl.innerText='Download'; dl.className='btn-small';
      actions.appendChild(dl);
      if(isAdmin()){
        const del = document.createElement('button'); del.innerText='Hapus'; del.className='btn-small btn-danger'; del.addEventListener('click', ()=>{ if(!confirm('Hapus foto ini?')) return; const all = loadGallery(); saveGallery(all.filter(x=>x.id!==item.id)); renderGallery(); });
        actions.appendChild(del);
      }
      card.appendChild(actions);
      galleryGrid.appendChild(card);
    });
  }

  function clearPreview(){ if(galleryPreview) galleryPreview.innerHTML=''; }

  if(galleryFile){
    galleryFile.addEventListener('change', (e)=>{
      const files = Array.from(e.target.files||[]);
      galleryPreview.innerHTML = '';
      files.slice(0,6).forEach(f=>{ // limit preview
        const r = new FileReader();
        r.onload = function(ev){ const img = document.createElement('img'); img.src = ev.target.result; img.className='preview-thumb'; galleryPreview.appendChild(img); };
        r.readAsDataURL(f);
      });
    });
  }

  if(saveGalleryBtn){
    saveGalleryBtn.addEventListener('click', ()=>{
      if(!isAdmin()){ alert('Hanya admin yang dapat mengunggah foto.'); return; }
      const files = Array.from(galleryFile.files||[]);
      const caption = galleryCaption.value.trim();
      if(files.length===0){ alert('Pilih minimal satu foto untuk diunggah.'); return; }
      const all = loadGallery();
      let pending = files.length;
      files.forEach(f=>{
        const r = new FileReader();
        r.onload = function(ev){
          all.push({ id: Date.now() + Math.floor(Math.random()*1000), caption: caption, date: Date.now(), dataURL: ev.target.result });
          pending--; if(pending===0){ saveGallery(all); galleryFile.value=''; galleryCaption.value=''; clearPreview(); renderGallery(); alert('Foto kegiatan berhasil diunggah.'); }
        };
        r.readAsDataURL(f);
      });
    });
  }

  // show/hide panel depending on admin state
  function updateGalleryPanel(){ if(galleryPanel) galleryPanel.style.display = isAdmin() ? 'block' : 'none'; renderGallery(); }
  window.addEventListener('storage', (e)=>{ if(e.key === 'dap_admin' || e.key === key) updateGalleryPanel(); });

  // Seed gallery with three default placeholder images (only if empty)
  (function seedDefaults(){
    try{
      const cur = loadGallery();
      if(!cur || cur.length===0){
        const seed = [
          { id: 1, caption: 'Sosialisasi ASKI — placeholder', date: Date.now(), dataURL: 'assets/img/foto1.svg' },
          { id: 2, caption: 'Rak arsip — placeholder', date: Date.now(), dataURL: 'assets/img/foto2.svg' },
          { id: 3, caption: 'Tim Arsip — placeholder', date: Date.now(), dataURL: 'assets/img/foto3.svg' }
        ];
        saveGallery(seed);
      }
    }catch(e){ console.warn('Gagal menanam foto default', e); }
  })();

  updateGalleryPanel();
})();