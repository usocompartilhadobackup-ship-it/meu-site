// ==================== HOME ====================
const WEEKDAY_SHORT = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const WEEKDAY_LONG  = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];

function initHome(){ renderHeader(); renderRank(); renderTodayCard(); renderWeekGrid(); renderStats(); }

function plural(count, singular, pluralForm){ return count === 1 ? singular : pluralForm; }

function renderHeader(){
  const name = (auth.currentUser && auth.currentUser.displayName || '').split(' ')[0];
  document.getElementById('home-title').textContent = name ? `A bordo, ${name}` : 'A bordo';
  document.getElementById('home-date').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function renderRank(){
  const rank = rankFor(state.totalWorkouts);
  document.getElementById('rank-name').textContent = rank.name;
  document.getElementById('rank-next').textContent = rank.next
    ? `${rank.remaining} até ${rank.next}`
    : 'Patente máxima';
  document.getElementById('rank-fill').style.width = Math.round(rank.progress * 100) + '%';
}

function renderWeekGrid(){
  const todayIdx = mondayIndex();
  document.getElementById('week-grid').innerHTML = weekDateKeys().map((key, i) => {
    const done = state.completedDays.includes(key);
    const planned = state.workouts.some(w => w.day === i);
    const classes = ['day-pill', i === todayIdx && 'today', done && 'done', !done && planned && 'has-workout'].filter(Boolean).join(' ');
    const status = done ? 'treino concluído' : planned ? 'treino planejado' : 'sem treino';
    return `<li class="${classes}" aria-label="${WEEKDAY_LONG[i]}, ${status}">
      <span>${WEEKDAY_SHORT[i]}</span>
      <span class="day-num">${done ? icon('check') : parseDateKey(key).getDate()}</span>
    </li>`;
  }).join('');
}

function renderTodayCard(){
  const workout = state.workouts.find(w => w.day === mondayIndex());
  const cta = document.getElementById('today-cta');
  const name = document.getElementById('today-name');
  const meta = document.getElementById('today-meta');
  if(workout){
    const count = workout.exercises.length;
    const inProgress = activeSession && activeSession.workout.day === workout.day;
    name.textContent = workout.name;
    meta.textContent = `${count} ${plural(count, 'exercício', 'exercícios')}`;
    cta.innerHTML = icon('play') + (inProgress ? 'Continuar missão' : 'Iniciar missão');
    cta.className = 'btn-primary';
  } else {
    name.textContent = 'Recarga dos propulsores';
    meta.textContent = 'Dia de descanso: nenhum treino planejado';
    cta.innerHTML = icon('calendar') + 'Planejar treino';
    cta.className = 'btn-secondary btn-block';
  }
}

ACTIONS.todayCta = () => {
  if(state.workouts.some(w => w.day === mondayIndex())) startWorkout();
  else document.querySelector('.nav-btn[data-screen="plan"]').click();
};

function countSetsToday(){
  const today = toDateKey();
  return Object.keys(state.loadHistory).reduce((total, eid) => {
    const record = getRecordOn(eid, today);
    return total + (record ? recordSets(record).length : 0);
  }, 0);
}

function renderStats(){
  const week = weekDateKeys();
  document.getElementById('stat-week').textContent  = state.completedDays.filter(d => week.includes(d)).length;
  document.getElementById('stat-sets').textContent  = countSetsToday();
  document.getElementById('stat-total').textContent = state.totalWorkouts;
  document.getElementById('stat-min').textContent   = state.totalMinutes;
  const streak = computeStreak(state.completedDays);
  document.getElementById('streak-chip').innerHTML =
    icon('flame') + `${streak} ${plural(streak, 'dia em órbita', 'dias em órbita')}`;
}
