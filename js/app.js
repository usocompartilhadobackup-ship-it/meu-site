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

// ==================== TOAST ====================
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
