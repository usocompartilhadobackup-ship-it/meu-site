// ==================== PWA / SERVICE WORKER ====================
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW register failed:', e));
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
});

// ==================== TOAST ====================
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
