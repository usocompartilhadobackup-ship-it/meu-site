// ==================== SETTINGS ====================
function initSettings(){
  document.getElementById('rest-default').value = state.restDefault || 60;
  const toggle = document.getElementById('notif-toggle');
  toggle.classList.toggle('on', !!state.notifEnabled);
  document.getElementById('notif-time-wrap').style.display = state.notifEnabled ? 'block' : 'none';
  document.getElementById('notif-time').value = state.notifTime || '07:00';
  renderNotifDays();
  checkNotifPermission();
  const user = auth.currentUser;
  if(user){
    document.getElementById('settings-user-email').textContent = user.email;
    document.getElementById('admin-section').style.display = user.email === ADMIN_EMAIL ? 'block' : 'none';
  }
}

function checkNotifPermission(){
  const area = document.getElementById('notif-permission-area');
  if(!('Notification' in window)){
    area.innerHTML = '<div class="notif-banner"><p>⚠️ Use o Safari no iPhone para notificações.</p></div>';
    return;
  }
  if(Notification.permission === 'default'){
    area.innerHTML = `<div class="notif-banner"><p>🔔 Ative as notificações para lembretes de treino!</p><button onclick="requestNotifPermission()">Ativar</button></div>`;
  } else if(Notification.permission === 'denied'){
    area.innerHTML = `<div class="notif-banner"><p>🚫 Notificações bloqueadas. Vá em Ajustes > Safari para ativar.</p></div>`;
  } else { area.innerHTML = ''; }
}

function requestNotifPermission(){
  Notification.requestPermission().then(p => {
    checkNotifPermission();
    if(p === 'granted'){ showToast('🔔 Notificações ativadas!'); scheduleNotifications(); }
  });
}

function toggleNotif(){
  const btn = document.getElementById('notif-toggle');
  state.notifEnabled = !state.notifEnabled; save();
  btn.classList.toggle('on', state.notifEnabled);
  document.getElementById('notif-time-wrap').style.display = state.notifEnabled ? 'block' : 'none';
  if(state.notifEnabled){
    if(Notification.permission === 'default') requestNotifPermission();
    else if(Notification.permission === 'granted'){ scheduleNotifications(); showToast('🔔 Lembretes ativados!'); }
  } else { showToast('🔕 Lembretes desativados'); }
}

function saveNotifTime(){
  state.notifTime = document.getElementById('notif-time').value;
  save();
  if(state.notifEnabled) scheduleNotifications();
}

function saveRestDefault(){
  state.restDefault = parseInt(document.getElementById('rest-default').value);
  save();
  showToast('⏱ Descanso padrão salvo!');
}

function renderNotifDays(){
  const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const cont = document.getElementById('notif-days'); cont.innerHTML = '';
  days.forEach((d, i) => {
    const chip = document.createElement('div');
    chip.className = 'chip' + ((state.notifDays||[0,1,2,3,4]).includes(i) ? ' selected' : '');
    chip.textContent = d;
    chip.onclick = () => {
      const nd  = state.notifDays || [];
      const idx = nd.indexOf(i);
      if(idx > -1) nd.splice(idx,1); else nd.push(i);
      state.notifDays = nd; save();
      chip.classList.toggle('selected');
      if(state.notifEnabled) scheduleNotifications();
    };
    cont.appendChild(chip);
  });
}

function scheduleNotifications(){
  if(Notification.permission !== 'granted') return;
  save();
  clearInterval(window._notifChecker);
  window._notifChecker = setInterval(checkNotifTime, 60000);
}

function checkNotifTime(){
  if(!state.notifEnabled || Notification.permission !== 'granted') return;
  const now = new Date();
  const [h, m] = state.notifTime.split(':').map(Number);
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  if(now.getHours() === h && now.getMinutes() === m && (state.notifDays||[]).includes(dayOfWeek)){
    const todayKey = 'notif_' + now.toISOString().split('T')[0];
    if(!localStorage.getItem(todayKey)){
      localStorage.setItem(todayKey,'1');
      const workout = state.workouts.find(w => w.day === dayOfWeek);
      new Notification('GymFlow 🌌', {
        body: workout ? 'Hoje é dia de ' + workout.name + '! Bora forjar sua galáxia 💪' : 'Não esqueça de se mover hoje!'
      });
    }
  }
}

if(state.notifEnabled && Notification.permission === 'granted') scheduleNotifications();
