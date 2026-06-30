// ==================== HOME ====================
function initHome(){ renderWeekGrid(); renderTodayCard(); renderStats(); }

function renderWeekGrid(){
  const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const today = new Date();
  const grid  = document.getElementById('week-grid'); grid.innerHTML = '';
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  for(let i = 0; i < 7; i++){
    const d       = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday    = i === currentDay;
    const isDone     = state.completedDays.includes(dateStr);
    const hasWorkout = state.workouts.some(w => w.day === i);
    const pill = document.createElement('div');
    pill.className = 'day-pill' + (isToday?' today':'') + (isDone?' done':hasWorkout?' has-workout':'');
    pill.innerHTML = `<span>${days[i]}</span><span class="day-num">${d.getDate()}</span>`;
    grid.appendChild(pill);
  }
}

function renderTodayCard(){
  const workout = state.workouts.find(w => w.day === currentDay);
  if(workout){
    document.getElementById('today-name').textContent = workout.name;
    document.getElementById('today-meta').textContent = workout.exercises.length + ' exercícios';
    document.getElementById('start-workout-btn').style.display = 'block';
  } else {
    document.getElementById('today-name').textContent = 'Descanso 😴';
    document.getElementById('today-meta').textContent = 'Nenhum treino planejado para hoje';
    document.getElementById('start-workout-btn').style.display = 'none';
  }
}

function renderStats(){
  const today     = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  const weekDays = [];
  for(let i = 0; i < 7; i++){
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    weekDays.push(d.toISOString().split('T')[0]);
  }
  document.getElementById('stat-week').textContent  = state.completedDays.filter(d => weekDays.includes(d)).length;
  document.getElementById('stat-total').textContent = state.totalWorkouts;
  document.getElementById('stat-min').textContent   = state.totalMinutes;
  document.getElementById('stat-exs').textContent   = activeChecked.size;
  let streak = 0;
  const sorted = [...state.completedDays].sort().reverse();
  if(sorted.length > 0){
    let check = new Date(today.toISOString().split('T')[0]);
    for(let i = 0; i < 365; i++){
      const s = check.toISOString().split('T')[0];
      if(sorted.includes(s)){ streak++; check.setDate(check.getDate()-1); } else break;
    }
  }
  document.getElementById('streak-num').textContent = streak + ' dia' + (streak !== 1 ? 's' : '') + ' 🔥';
}
