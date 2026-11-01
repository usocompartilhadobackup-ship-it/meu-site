// ==================== ACTIVE WORKOUT ====================
// activeSession.sets[eid] = [{ weight, reps, done }]
// Os cronômetros usam horário real, pois o celular suspende intervalos com a tela apagada.
const REST_RING_LENGTH = 2 * Math.PI * 80;
const MAX_SETS = 12;

let activeSession = null;
let timerInterval = null;
let restInterval = null, restEndsAt = 0, restTotal = 0;

function buildSessionSets(ex){
  const today = getRecordOn(ex.id, toDateKey());
  if(today) return recordSets(today).map(s => ({ ...s, done: true }));
  const scheme = parseSetScheme(ex.sets);
  const last   = getLastRecord(ex.id);
  const lastSets = last ? recordSets(last) : [];
  return Array.from({ length: Math.max(scheme.count, lastSets.length) }, (_, i) => {
    const reference = lastSets[i] || lastSets[lastSets.length - 1];
    return { weight: reference ? reference.weight : '', reps: reference ? reference.reps : scheme.reps, done: false };
  });
}

function startWorkout(){
  const workout = state.workouts.find(w => w.day === mondayIndex());
  if(!workout) return;
  if(!activeSession || activeSession.workout !== workout){
    const sets = {};
    workout.exercises.forEach(eid => {
      const ex = findExercise(eid);
      if(ex) sets[eid] = buildSessionSets(ex);
    });
    activeSession = { workout, sets, elapsedMs: 0, runningSince: Date.now() };
  }
  document.getElementById('active-title').textContent = workout.name;
  renderActiveExercises();
  updateProgress();
  renderTimer();
  startTimerTicks();
  openModal('active-modal');
}

function sessionElapsedSeconds(){
  const { elapsedMs, runningSince } = activeSession;
  return Math.floor((elapsedMs + (runningSince ? Date.now() - runningSince : 0)) / 1000);
}

function renderActiveExercises(){
  document.getElementById('active-exercises').innerHTML = Object.keys(activeSession.sets).map(eid => {
    const ex   = findExercise(eid);
    const sets = activeSession.sets[eid];
    const complete = sets.every(s => s.done);
    return `<article class="session-exercise ${complete ? 'complete' : ''}">
      <header class="session-exercise-header">
        <button type="button" class="thumb-btn" data-action="openGifLightbox" data-eid="${eid}" aria-label="Ampliar demonstração de ${escapeHtml(ex.name)}">${makeThumb(ex)}<span class="expand-badge">${icon('expand')}</span></button>
        <div class="ex-info"><h3>${escapeHtml(ex.name)}</h3><p>Meta ${escapeHtml(ex.sets)} · ${restSecondsFor(ex)}s de descanso</p></div>
      </header>
      <div class="set-table" role="group" aria-label="Séries de ${escapeHtml(ex.name)}">
        <div class="set-row set-head" aria-hidden="true"><span>Série</span><span>Peso (kg)</span><span>Reps</span><span></span></div>
        ${sets.map((s, i) => `<div class="set-row ${s.done ? 'done' : ''}">
          <span class="set-number">${i + 1}</span>
          <input class="set-input" type="number" min="0" step="0.5" inputmode="decimal" value="${escapeHtml(s.weight)}" aria-label="Peso da série ${i + 1}" data-change="updateSet" data-eid="${eid}" data-index="${i}" data-field="weight">
          <input class="set-input" type="number" min="0" inputmode="numeric" value="${escapeHtml(s.reps)}" aria-label="Repetições da série ${i + 1}" data-change="updateSet" data-eid="${eid}" data-index="${i}" data-field="reps">
          <button type="button" class="set-check" data-action="toggleSet" data-eid="${eid}" data-index="${i}" aria-pressed="${s.done}" aria-label="Concluir série ${i + 1}">${icon('check')}</button>
        </div>`).join('')}
      </div>
      <div class="set-tools">
        <button type="button" class="text-btn" data-action="removeSet" data-eid="${eid}" ${sets.length <= 1 ? 'disabled' : ''}>${icon('minus')}Remover série</button>
        <button type="button" class="text-btn" data-action="addSet" data-eid="${eid}" ${sets.length >= MAX_SETS ? 'disabled' : ''}>${icon('plus')}Adicionar série</button>
      </div>
    </article>`;
  }).join('');
}

function persistExerciseSets(eid){
  const done = activeSession.sets[eid]
    .filter(s => s.done)
    .map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }));
  saveLoadRecord(eid, done);
}

ACTIONS.updateSet = (el) => {
  const { eid, index, field } = el.dataset;
  const set = activeSession.sets[eid][Number(index)];
  set[field] = el.value;
  if(set.done) persistExerciseSets(eid);
};

ACTIONS.toggleSet = (el) => {
  const { eid } = el.dataset;
  const index = Number(el.dataset.index);
  const set = activeSession.sets[eid][index];
  set.done = !set.done;
  persistExerciseSets(eid);
  renderActiveExercises();
  updateProgress();
  renderStats();
  if(set.done && navigator.vibrate) navigator.vibrate(30);
  if(set.done && countSets().done < countSets().total) startRestTimer(restSecondsFor(findExercise(eid)), nextStepLabel());
};

ACTIONS.addSet = (el) => {
  const sets = activeSession.sets[el.dataset.eid];
  const reference = sets[sets.length - 1];
  sets.push({ weight: reference.weight, reps: reference.reps, done: false });
  renderActiveExercises();
  updateProgress();
};

ACTIONS.removeSet = (el) => {
  const { eid } = el.dataset;
  const sets = activeSession.sets[eid];
  if(sets.length <= 1) return;
  sets.pop();
  persistExerciseSets(eid);
  renderActiveExercises();
  updateProgress();
};

function restSecondsFor(ex){ return state.restOverride || ex.rest; }

function nextStepLabel(){
  const pending = Object.keys(activeSession.sets).find(eid => activeSession.sets[eid].some(s => !s.done));
  return pending ? findExercise(pending).name : null;
}

function countSets(){
  const all = Object.values(activeSession.sets).flat();
  return { total: all.length, done: all.filter(s => s.done).length };
}

function updateProgress(){
  const { total, done } = countSets();
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-count').textContent = `${done} de ${total} séries`;
  document.getElementById('progress-pct').textContent   = pct + '%';
  document.getElementById('progress-fill').style.width  = pct + '%';
}

// ── Cronômetro ──────────────────────────────────────────────────────────
function renderTimer(){
  if(!activeSession) return;
  document.getElementById('workout-timer').textContent = formatClock(sessionElapsedSeconds());
  const running = !!activeSession.runningSince;
  const toggle = document.getElementById('timer-toggle');
  toggle.innerHTML = icon(running ? 'pause' : 'play');
  toggle.setAttribute('aria-label', running ? 'Pausar cronômetro' : 'Retomar cronômetro');
}

function startTimerTicks(){
  clearInterval(timerInterval);
  timerInterval = setInterval(renderTimer, 1000);
}

ACTIONS.toggleTimer = () => {
  if(activeSession.runningSince){
    activeSession.elapsedMs += Date.now() - activeSession.runningSince;
    activeSession.runningSince = null;
  } else {
    activeSession.runningSince = Date.now();
  }
  renderTimer();
};

ACTIONS.resetTimer = () => {
  activeSession.elapsedMs = 0;
  if(activeSession.runningSince) activeSession.runningSince = Date.now();
  renderTimer();
};

ACTIONS.finishWorkout = async () => {
  const { done } = countSets();
  if(done === 0){
    const confirmed = await confirmDialog({
      title: 'Encerrar sem séries?',
      message: 'Nenhuma série foi marcada como concluída. O treino contará mesmo assim.',
      confirmLabel: 'Finalizar'
    });
    if(!confirmed) return;
  }
  const todayKey = toDateKey();
  if(!state.completedDays.includes(todayKey)){
    state.completedDays.push(todayKey);
    state.totalWorkouts++;
  }
  state.totalMinutes += Math.max(1, Math.round(sessionElapsedSeconds() / 60));
  save();
  clearInterval(timerInterval);
  activeSession = null;
  closeModal('active-modal');
  initHome();
  initProgress();
  showToast('Missão concluída. Do not go gentle.');
};

// ── Descanso ────────────────────────────────────────────────────────────
function renderRest(){
  const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
  document.getElementById('rest-num').textContent = remaining;
  document.getElementById('rest-arc').style.strokeDashoffset = REST_RING_LENGTH * (1 - remaining / restTotal);
  if(remaining === 0){
    ACTIONS.skipRest();
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
}

function startRestTimer(seconds, nextExerciseName){
  clearInterval(restInterval);
  restTotal  = seconds;
  restEndsAt = Date.now() + seconds * 1000;
  document.getElementById('rest-next-ex').textContent = nextExerciseName ? 'A seguir: ' + nextExerciseName : '';
  document.getElementById('rest-overlay').classList.add('open');
  updateBodyLock();
  renderRest();
  restInterval = setInterval(renderRest, 250);
}

ACTIONS.skipRest = () => {
  clearInterval(restInterval);
  document.getElementById('rest-overlay').classList.remove('open');
  updateBodyLock();
};

ACTIONS.addRestTime = () => {
  restEndsAt += 15000;
  restTotal  += 15;
  renderRest();
};
