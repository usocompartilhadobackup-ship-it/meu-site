// ==================== PROGRESS ====================
const CHART_WEEKS = 6;
const BEST_WEEK_LOOKBACK = 52;

function initProgress(){ renderWeeklyChart(); renderMuscleBars(); renderProgressStats(); }

function countCompletedIn(dateKeys){
  return state.completedDays.filter(d => dateKeys.includes(d)).length;
}

function renderWeeklyChart(){
  const weeks = Array.from({ length: CHART_WEEKS }, (_, i) => {
    const keys = weekDateKeys(new Date(), CHART_WEEKS - 1 - i);
    const monday = parseDateKey(keys[0]);
    return { label: `${monday.getDate()}/${monday.getMonth() + 1}`, count: countCompletedIn(keys) };
  });
  const max = Math.max(...weeks.map(w => w.count), 1);
  const chart = document.getElementById('weekly-chart');
  chart.setAttribute('aria-label', `Treinos nas últimas ${CHART_WEEKS} semanas: ` + weeks.map(w => w.count).join(', '));
  chart.innerHTML = weeks.map((w, i) => {
    const height = Math.max(6, Math.round((w.count / max) * 100));
    return `<div class="bar-col"><span class="bar-value">${w.count}</span><div class="bar ${i === weeks.length - 1 ? 'active-bar' : ''}" style="height:${height}%"></div><span class="bar-label">${w.label}</span></div>`;
  }).join('');
}

function renderMuscleBars(){
  const groups = {};
  state.workouts.forEach(w => w.exercises.forEach(eid => {
    const ex = findExercise(eid);
    if(ex) groups[ex.group] = (groups[ex.group] || 0) + 1;
  }));
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  const wrap = document.getElementById('muscle-bars');
  if(!entries.length){
    wrap.innerHTML = '<p class="muted-text">Crie um treino no plano para ver a distribuição.</p>';
    return;
  }
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  wrap.innerHTML = entries.map(([group, count]) => {
    const pct = Math.round((count / total) * 100);
    return `<div class="muscle-row">
      <div class="muscle-row-label"><span>${escapeHtml(group)}</span><span>${count} · ${pct}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function renderProgressStats(){
  let best = 0;
  for(let w = 0; w < BEST_WEEK_LOOKBACK; w++){
    best = Math.max(best, countCompletedIn(weekDateKeys(new Date(), w)));
  }
  document.getElementById('best-week').textContent = best;
  const monthPrefix = toDateKey().slice(0, 7);
  document.getElementById('month-count').textContent = state.completedDays.filter(d => d.startsWith(monthPrefix)).length;
}
