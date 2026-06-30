// ==================== PROGRESS ====================
function initProgress(){ renderWeeklyChart(); renderMuscleDonut(); renderProgressStats(); }

function renderWeeklyChart(){
  const chart = document.getElementById('weekly-chart'); chart.innerHTML = '';
  const weeks = [], today = new Date();
  for(let w = 5; w >= 0; w--){
    const start = new Date(today);
    start.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - (w*7));
    let count = 0;
    for(let d = 0; d < 7; d++){
      const dd = new Date(start); dd.setDate(start.getDate() + d);
      if(state.completedDays.includes(dd.toISOString().split('T')[0])) count++;
    }
    weeks.push({ label:'S' + (6-w), count });
  }
  const max = Math.max(...weeks.map(w => w.count), 1);
  weeks.forEach((w, i) => {
    const col = document.createElement('div'); col.className = 'bar-col';
    const h   = Math.max(4, Math.round((w.count / max) * 72));
    col.innerHTML = `<div class="bar ${i===weeks.length-1?'active-bar':''}" style="height:${h}px"></div><div class="bar-label">${w.label}</div>`;
    chart.appendChild(col);
  });
}

function renderMuscleDonut(){
  const groups = {};
  state.workouts.forEach(w => w.exercises.forEach(eid => {
    const ex = EXERCISES_DB.find(e => e.id === eid);
    if(ex) groups[ex.group] = (groups[ex.group] || 0) + 1;
  }));
  const total   = Object.values(groups).reduce((a,b) => a+b, 0) || 1;
  const colors  = ['#b044ff','#ff6b9d','#00d4ff','#06d6a0','#ffd700','#7c3aed'];
  const entries = Object.entries(groups);
  const wrap    = document.getElementById('muscle-donut');
  if(!entries.length){ wrap.innerHTML = '<p style="color:var(--muted);font-size:13px">Adicione treinos para ver</p>'; return; }
  let offset = 0;
  const slices = entries.map(([g, c], i) => {
    const pct  = c/total, dash = pct*100, gap = 100-dash;
    const s    = `<circle cx="40" cy="40" r="30" fill="none" stroke="${colors[i%colors.length]}" stroke-width="14" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" transform="rotate(-90 40 40)"/>`;
    offset += pct*100;
    return { s, g, pct, color:colors[i%colors.length] };
  });
  wrap.innerHTML = `<div class="donut-chart"><svg viewBox="0 0 80 80" width="80" height="80">${slices.map(s=>s.s).join('')}</svg><div class="donut-center">${entries.length}<br>grupos</div></div><div class="donut-legend">${slices.map(s=>`<div class="legend-item"><div class="legend-dot" style="background:${s.color}"></div><span>${s.g} ${Math.round(s.pct*100)}%</span></div>`).join('')}</div>`;
}

function renderProgressStats(){
  const today = new Date(); let best = 0;
  for(let w = 0; w < 52; w++){
    const start = new Date(today);
    start.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - (w*7));
    let count = 0;
    for(let d = 0; d < 7; d++){
      const dd = new Date(start); dd.setDate(start.getDate() + d);
      if(state.completedDays.includes(dd.toISOString().split('T')[0])) count++;
    }
    if(count > best) best = count;
  }
  document.getElementById('best-week').textContent = best;
  const month = today.getMonth(), year = today.getFullYear();
  document.getElementById('month-count').textContent = state.completedDays.filter(d => {
    const dd = new Date(d); return dd.getMonth() === month && dd.getFullYear() === year;
  }).length;
}
