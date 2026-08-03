// ==================== PWA / SERVICE WORKER ====================
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW register failed:', e));
  });

  // When a new service worker takes over (new version deployed), reload once
  // so the tab picks up the fresh HTML/JS instead of running stale code.
  let swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if(swRefreshing) return;
    swRefreshing = true;
    window.location.reload();
  });
}

// ==================== NAV ====================
function goScreen(id, btn){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  btn.classList.add('active');
  if(id === 'progress') initProgress();
}

// ==================== MODAL ====================
function closeModal(e, id){
  if(e.target.classList.contains('modal-overlay'))
    document.getElementById(id).classList.remove('open');
}

function dismissModal(id){
  document.getElementById(id).classList.remove('open');
}

document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  const rest = document.getElementById('rest-overlay');
  if(rest) rest.classList.remove('open');
  closeGifLightbox();
});

// ==================== GIF FULLSCREEN LIGHTBOX ====================
function openGifLightbox(slug, name){
  const img = document.getElementById('gif-lightbox-img');
  img.src = imgSrc(slug);
  img.onerror = function(){
    if(this.src.endsWith('.gif')) this.src = this.src.replace('.gif', '.svg');
  };
  document.getElementById('gif-lightbox-caption').textContent = name || '';
  document.getElementById('gif-lightbox').classList.add('open');
}

function closeGifLightbox(){
  document.getElementById('gif-lightbox').classList.remove('open');
}

// ==================== TOAST ====================
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
