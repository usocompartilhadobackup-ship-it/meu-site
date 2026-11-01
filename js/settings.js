// ==================== SETTINGS ====================
const NOTIF_CHECK_INTERVAL = 30000;
let notifChecker = null;

const notificationsSupported = () => 'Notification' in window && 'serviceWorker' in navigator;

function initSettings(){
  document.getElementById('rest-override').value = String(state.restOverride || 0);
  document.getElementById('notif-time').value = state.notifTime || '07:00';
  renderNotifToggle();
  renderNotifDays();
  renderNotifPermission();
  scheduleNotifications();
  const user = auth.currentUser;
  if(user) document.getElementById('settings-user-email').textContent = user.email;
  showAdminSectionIfAllowed();
}

function renderNotifToggle(){
  const toggle = document.getElementById('notif-toggle');
  toggle.classList.toggle('on', !!state.notifEnabled);
  toggle.setAttribute('aria-checked', !!state.notifEnabled);
  document.getElementById('notif-time-wrap').hidden = !state.notifEnabled;
}

function renderNotifPermission(){
  const area = document.getElementById('notif-permission-area');
  if(!notificationsSupported()){
    area.innerHTML = `<div class="banner">${icon('info')}<p>No iPhone, instale o app na Tela de Início para usar lembretes.</p></div>`;
  } else if(Notification.permission === 'default'){
    area.innerHTML = `<div class="banner">${icon('bell')}<p>Permita notificações para receber lembretes.</p><button type="button" class="btn-secondary" data-action="requestNotifPermission">Permitir</button></div>`;
  } else if(Notification.permission === 'denied'){
    area.innerHTML = `<div class="banner">${icon('info')}<p>Notificações bloqueadas. Libere nas configurações do navegador.</p></div>`;
  } else {
    area.innerHTML = '';
  }
}

async function requestPermission(){
  const permission = await Notification.requestPermission();
  renderNotifPermission();
  scheduleNotifications();
  return permission;
}

ACTIONS.requestNotifPermission = () => requestPermission();

ACTIONS.toggleNotif = async () => {
  state.notifEnabled = !state.notifEnabled;
  save();
  renderNotifToggle();
  if(!state.notifEnabled){ showToast('Lembretes desativados'); scheduleNotifications(); return; }
  if(!notificationsSupported()){ showToast('Seu navegador não permite lembretes aqui', 'error'); return; }
  const permission = Notification.permission === 'default' ? await requestPermission() : Notification.permission;
  if(permission === 'granted'){ scheduleNotifications(); showToast('Lembretes ativados'); }
};

ACTIONS.saveNotifTime = (el) => {
  state.notifTime = el.value;
  save();
};

ACTIONS.saveRestOverride = (el) => {
  state.restOverride = Number(el.value);
  save();
  showToast('Descanso salvo');
};

function renderNotifDays(){
  const selected = state.notifDays || [];
  document.getElementById('notif-days').innerHTML = WEEKDAY_SHORT.map((d, i) =>
    `<button type="button" class="chip ${selected.includes(i) ? 'selected' : ''}" data-action="toggleNotifDay" data-day="${i}" aria-pressed="${selected.includes(i)}">${d}</button>`
  ).join('');
}

ACTIONS.toggleNotifDay = (el) => {
  const day = Number(el.dataset.day);
  const days = state.notifDays || [];
  state.notifDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
  save();
  renderNotifDays();
};

function scheduleNotifications(){
  clearInterval(notifChecker);
  if(state.notifEnabled && notificationsSupported() && Notification.permission === 'granted'){
    notifChecker = setInterval(checkNotifTime, NOTIF_CHECK_INTERVAL);
  }
}

function checkNotifTime(){
  const now = new Date();
  const [hours, minutes] = (state.notifTime || '07:00').split(':').map(Number);
  const day = mondayIndex(now);
  if(now.getHours() !== hours || now.getMinutes() !== minutes || !(state.notifDays || []).includes(day)) return;
  const sentKey = 'gymflow_notif_' + toDateKey(now);
  if(localStorage.getItem(sentKey)) return;
  localStorage.setItem(sentKey, '1');
  const workout = state.workouts.find(w => w.day === day);
  // new Notification() não funciona em celular: é preciso usar o service worker.
  navigator.serviceWorker.ready.then(registration => registration.showNotification('GymFlow', {
    body: workout ? `Hoje é dia de ${workout.name}. Vamos treinar?` : 'Hoje não tem treino planejado. Que tal se mexer um pouco?',
    icon: 'img/icons/icon-192.png'
  }));
}
