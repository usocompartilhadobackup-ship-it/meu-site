// ==================== ACTIVE WORKOUT ====================
function startWorkout(){
  const workout = state.workouts.find(w => w.day === currentDay); if(!workout) return;
  activeWorkout = workout; activeChecked = new Set();
  timerSeconds = 0; timerRunning = false; clearInterval(timerInterval);
  document.getElementById('workout-timer').textContent  = '00:00';
  document.getElementById('timer-toggle').textContent   = '▶ Iniciar';
  document.getElementById('active-title').textContent   = workout.name;
  renderActiveExercises(); updateProgress();
  document.getElementById('active-modal').classList.add('open');
}

function renderActiveExercises(){
  const cont = document.getElementById('active-exercises'); cont.innerHTML = '';
  activeWorkout.exercises.forEach(eid => {
    const ex      = EXERCISES_DB.find(e => e.id === eid); if(!ex) return;
    const checked = activeChecked.has(eid);
    const hist    = state.loadHistory[eid];
    const item    = document.createElement('div');
    item.className = 'exercise-item';
    item.style.opacity = checked ? '.45' : '1';
    item.innerHTML = `
      <div class="ex-thumb-expandable" onclick="openGifLightbox('${ex.img}','${ex.name.replace(/'/g,"\\'")}')">
        ${makeThumb(ex.img, ex.icon, 52)}
        <div class="ex-thumb-expand-badge"><svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg></div>
      </div>
      <div class="ex-info" style="flex:1">
        <h5>${ex.name}</h5>
        <p>${ex.sets} • ${ex.rest}s descanso</p>
        <div class="load-row" style="margin-top:8px">
          <div class="load-input-wrap">
            <div class="load-label">Peso kg</div>
            <input class="load-input" id="w-${eid}" type="number" placeholder="kg" inputmode="decimal" value="${hist?hist.weight:''}" onchange="saveActiveLoad('${eid}')">
          </div>
          <div class="load-input-wrap">
            <div class="load-label">Reps</div>
            <input class="load-input" id="r-${eid}" type="number" placeholder="reps" inputmode="numeric" value="${hist?hist.reps:''}" onchange="saveActiveLoad('${eid}')">
          </div>
        </div>
      </div>
      <div class="ex-check ${checked?'checked':''}" onclick="toggleCheck('${eid}')" style="align-self:flex-start;margin-top:2px">${checked?'✓':''}</div>`;
    cont.appendChild(item);
  });
}

function saveActiveLoad(eid){
  const w = document.getElementById('w-' + eid)?.value;
  const r = document.getElementById('r-' + eid)?.value;
  if(w || r){
    state.loadHistory[eid] = { weight:w||0, reps:r||0, date:new Date().toISOString().split('T')[0] };
    save();
  }
}

function toggleCheck(eid){
  saveActiveLoad(eid);
  if(activeChecked.has(eid)) activeChecked.delete(eid);
  else {
    activeChecked.add(eid);
    const ex = EXERCISES_DB.find(e => e.id === eid);
    if(ex){
      const restTime = state.restDefault || ex.rest || 60;
      const exList   = activeWorkout.exercises;
      const idx      = exList.indexOf(eid);
      const nextEid  = exList[idx + 1];
      const nextEx   = nextEid ? EXERCISES_DB.find(e => e.id === nextEid) : null;
      if(activeChecked.size < exList.length) startRestTimer(restTime, nextEx ? nextEx.name : null);
    }
  }
  renderActiveExercises(); updateProgress(); renderStats();
}

function updateProgress(){
  if(!activeWorkout) return;
  const total = activeWorkout.exercises.length, done = activeChecked.size;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-pct').textContent   = pct + '%';
  document.getElementById('progress-fill').style.width  = pct + '%';
}

function toggleTimer(){
  if(timerRunning){
    clearInterval(timerInterval); timerRunning = false;
    document.getElementById('timer-toggle').textContent = '▶ Continuar';
  } else {
    timerRunning = true;
    document.getElementById('timer-toggle').textContent = '⏸ Pausar';
    timerInterval = setInterval(() => {
      timerSeconds++;
      const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
      const s = String(timerSeconds%60).padStart(2,'0');
      document.getElementById('workout-timer').textContent = m + ':' + s;
    }, 1000);
  }
}

function resetTimer(){
  clearInterval(timerInterval); timerRunning = false; timerSeconds = 0;
  document.getElementById('workout-timer').textContent  = '00:00';
  document.getElementById('timer-toggle').textContent   = '▶ Iniciar';
}

function finishWorkout(){
  clearInterval(timerInterval); timerRunning = false;
  const todayStr = new Date().toISOString().split('T')[0];
  if(!state.completedDays.includes(todayStr)) state.completedDays.push(todayStr);
  state.totalWorkouts++;
  state.totalMinutes += Math.round(timerSeconds / 60) || 1;
  save();
  document.getElementById('active-modal').classList.remove('open');
  activeChecked = new Set();
  initHome(); initProgress();
  showToast('🎉 Treino concluído! Você é uma supernova! 🌟');
}

// ==================== REST TIMER ====================
function startRestTimer(seconds, nextExName){
  clearInterval(restInterval);
  restTotal = seconds; restSeconds = seconds;
  document.getElementById('rest-num').textContent      = seconds;
  document.getElementById('rest-next-ex').textContent  = nextExName ? 'Próximo: ' + nextExName : 'Último exercício!';
  updateRestArc(seconds, seconds);
  document.getElementById('rest-overlay').classList.add('open');
  restInterval = setInterval(() => {
    restSeconds--;
    document.getElementById('rest-num').textContent = restSeconds;
    updateRestArc(restSeconds, restTotal);
    if(restSeconds <= 0){ skipRest(); if(navigator.vibrate) navigator.vibrate([200,100,200]); }
  }, 1000);
}

function updateRestArc(current, total){
  const circ = 2 * Math.PI * 80, pct = current / total;
  document.getElementById('rest-arc').style.strokeDashoffset = circ * (1 - pct);
}

function skipRest(){
  clearInterval(restInterval);
  document.getElementById('rest-overlay').classList.remove('open');
}

function addRestTime(){
  restSeconds += 15;
  document.getElementById('rest-num').textContent = restSeconds;
}
