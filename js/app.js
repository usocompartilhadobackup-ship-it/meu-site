// ==================== PWA / SERVICE WORKER ====================
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW register failed:', e));
  });

  // Recarrega uma vez quando uma nova versão assume, mas não na primeira instalação.
  const hadController = !!navigator.serviceWorker.controller;
  let swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if(!hadController || swRefreshing) return;
    swRefreshing = true;
    window.location.reload();
  });
}

// ==================== AÇÕES ====================
// Sem onclick no HTML: a CSP bloqueia scripts inline. Cada módulo registra suas ações aqui
// e os elementos as chamam por data-action, data-change, data-input ou data-submit.
const ACTIONS = {};

function dispatch(attribute, event){
  const el = event.target.closest(`[${attribute}]`);
  if(!el) return false;
  const handler = ACTIONS[el.getAttribute(attribute)];
  if(handler) handler(el, event);
  return true;
}

document.addEventListener('click',  e => dispatch('data-action', e));
document.addEventListener('change', e => dispatch('data-change', e));
document.addEventListener('input',  e => dispatch('data-input', e));
document.addEventListener('submit', e => {
  e.preventDefault();
  dispatch('data-submit', e);
});

// Se um GIF faltar, tenta a ilustração; sem nenhuma das duas, some sem deixar ícone quebrado.
document.addEventListener('error', e => {
  const img = e.target;
  if(img.tagName !== 'IMG' || !img.hasAttribute('data-media')) return;
  if(img.src.endsWith('.gif')) img.src = img.src.replace(/\.gif$/, '.svg');
  else img.hidden = true;
}, true);

// ==================== NAV ====================
const SCREEN_INIT = {
  home: () => initHome(),
  plan: () => initPlanner(),
  progress: () => initProgress()
};

ACTIONS.goScreen = (btn) => {
  const id = btn.dataset.screen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b === btn);
    if(b === btn) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  document.getElementById('screen-' + id).classList.add('active');
  if(SCREEN_INIT[id]) SCREEN_INIT[id]();
  window.scrollTo(0, 0);
  travelTo(id);
};

// ==================== MODAIS ====================
let modalReturnFocus = [];

function updateBodyLock(){
  document.body.classList.toggle('no-scroll', !!document.querySelector('.modal-overlay.open, .rest-overlay.open, .gif-lightbox.open'));
}

function openModal(id){
  const modal = document.getElementById(id);
  if(!modal.classList.contains('open')) modalReturnFocus.push(document.activeElement);
  modal.classList.add('open');
  updateBodyLock();
  const target = modal.querySelector('.modal-close, button');
  if(target) target.focus({ preventScroll: true });
}

function closeModal(id){
  const modal = document.getElementById(id);
  if(!modal.classList.contains('open')) return;
  modal.classList.remove('open');
  updateBodyLock();
  const previous = modalReturnFocus.pop();
  if(previous && document.contains(previous)) previous.focus({ preventScroll: true });
}

ACTIONS.dismissModal = (el) => closeModal(el.closest('.modal-overlay').id);

ACTIONS.overlayClick = (el, e) => {
  if(e.target === el) closeModal(el.id);
};

function topOpenLayer(){
  const layers = [...document.querySelectorAll('.modal-overlay.open, .rest-overlay.open, .gif-lightbox.open')];
  return layers.sort((a, b) => Number(getComputedStyle(b).zIndex) - Number(getComputedStyle(a).zIndex))[0];
}

document.addEventListener('keydown', e => {
  const layer = topOpenLayer();
  if(!layer) return;
  if(e.key === 'Escape'){
    if(layer.id === 'rest-overlay') ACTIONS.skipRest();
    else if(layer.id === 'gif-lightbox') ACTIONS.closeGifLightbox();
    else if(layer.id === 'confirm-modal') document.getElementById('confirm-cancel').click();
    else closeModal(layer.id);
    return;
  }
  if(e.key !== 'Tab') return;
  const focusable = [...layer.querySelectorAll('button, input, select, a[href]')].filter(el => el.offsetParent !== null);
  if(!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

function confirmDialog({ title, message, confirmLabel, danger = false }){
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  const ok = document.getElementById('confirm-ok');
  const cancel = document.getElementById('confirm-cancel');
  ok.textContent = confirmLabel;
  ok.classList.toggle('btn-destructive', danger);
  openModal('confirm-modal');
  return new Promise(resolve => {
    const finish = (answer) => {
      ok.onclick = cancel.onclick = null;
      closeModal('confirm-modal');
      resolve(answer);
    };
    ok.onclick = () => finish(true);
    cancel.onclick = () => finish(false);
  });
}

// ==================== IMAGEM EM TELA CHEIA ====================
ACTIONS.openGifLightbox = (el) => {
  const ex = findExercise(el.dataset.eid);
  if(!ex) return;
  const img = document.getElementById('gif-lightbox-img');
  img.hidden = false;
  img.src = imgSrc(ex.img);
  img.alt = 'Demonstração: ' + ex.name;
  document.getElementById('gif-lightbox-caption').textContent = ex.name;
  document.getElementById('gif-lightbox').classList.add('open');
  updateBodyLock();
};

ACTIONS.closeGifLightbox = () => {
  document.getElementById('gif-lightbox').classList.remove('open');
  updateBodyLock();
};

// ==================== TOAST ====================
let toastTimeout = null;

function showToast(message, type = 'success'){
  const toast = document.getElementById('toast');
  const name = type === 'error' ? 'info' : 'check';
  toast.innerHTML = icon(name) + `<span>${escapeHtml(message)}</span>`;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}
