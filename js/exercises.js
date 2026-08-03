// ==================== EXERCISE LIBRARY ====================
function initExercises(){
  const filterEl = document.getElementById('muscle-filter'); filterEl.innerHTML = '';
  GROUPS.forEach(g => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (g === filterGroup ? ' selected' : '');
    chip.textContent = g;
    chip.onclick = () => { filterGroup = g; initExercises(); };
    filterEl.appendChild(chip);
  });
  renderExerciseGrid();
}

function filterExercises(){ renderExerciseGrid(); }

function renderExerciseGrid(){
  const search = (document.getElementById('ex-search') || {}).value || '';
  const list   = document.getElementById('exercise-library'); list.innerHTML = '';
  let filtered = filterGroup === 'Todos' ? EXERCISES_DB : EXERCISES_DB.filter(e => e.group === filterGroup);
  if(search.trim()){
    const q = search.toLowerCase();
    filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q));
  }
  if(!filtered.length){
    list.style.display = 'block';
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🔭</div><p>Nenhum exercício encontrado</p></div>';
    return;
  }
  list.style.display = 'grid';
  filtered.forEach(ex => {
    const badge = GROUP_BADGE[ex.group] || 'badge-core';
    const card  = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-card-img">
        <img src="${imgSrc(ex.img)}" alt="${ex.name}"
          onerror="if(this.src.endsWith('.gif')){this.src=this.src.replace('.gif','.svg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
        <div class="ex-card-fallback">${ex.icon}</div>
      </div>
      <div class="ex-card-info">
        <h4>${ex.name}</h4>
        <p>${ex.muscle}</p>
        <span class="ex-card-badge ${badge}">${ex.sets}</span>
      </div>`;
    card.onclick = () => openExerciseModal(ex);
    list.appendChild(card);
  });
}

function openExerciseModal(ex){
  document.getElementById('modal-workout-title').textContent = ex.name;
  document.getElementById('modal-workout-meta').textContent  = ex.muscle + ' • ' + ex.sets + ' • Descanso: ' + ex.rest + 's';
  const hist  = getLastRecord(ex.id);
  const badge = GROUP_BADGE[ex.group] || 'badge-core';
  document.getElementById('modal-workout-body').innerHTML = `
    <div class="ex-detail-img">
      <img src="${imgSrc(ex.img)}" alt="${ex.name}"
        onerror="if(this.src.endsWith('.gif')){this.src=this.src.replace('.gif','.svg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
      <div class="ex-detail-fallback">${ex.icon}</div>
    </div>
    ${ex.tip ? `<div class="ex-tip-card"><div class="tip-label">⚡ Dica de execução</div><p>${ex.tip}</p></div>` : ''}
    <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Registrar carga de hoje</div>
    <div class="load-row">
      <div class="load-input-wrap"><div class="load-label">Peso (kg)</div><input class="load-input" id="lib-weight" type="number" placeholder="0" inputmode="decimal" value="${hist?hist.weight:''}"></div>
      <div class="load-input-wrap"><div class="load-label">Repetições</div><input class="load-input" id="lib-reps" type="number" placeholder="0" inputmode="numeric" value="${hist?hist.reps:''}"></div>
    </div>
    <button class="btn-primary" style="margin-top:14px" onclick="saveLibLoad('${ex.id}')">💾 Salvar registro</button>
    ${renderEvolutionSection(ex.id)}`;
  document.getElementById('workout-modal').classList.add('open');
}

function renderEvolutionSection(eid){
  const records = [...getHistoryArr(eid)].sort((a,b) => a.date.localeCompare(b.date));
  if(!records.length){
    return `<div class="section-title" style="margin-top:20px;margin-bottom:8px">Evolução de carga</div>
      <div class="empty-state" style="padding:24px 16px">
        <div class="empty-icon">📈</div>
        <p>Registre sua primeira carga acima para começar a acompanhar sua evolução neste exercício.</p>
      </div>`;
  }
  const max   = Math.max(...records.map(r => Number(r.weight) || 0), 1);
  const bars  = records.map((r, i) => {
    const h = Math.max(4, Math.round((Number(r.weight) / max) * 90));
    const d = new Date(r.date + 'T00:00:00');
    const label = d.getDate() + '/' + (d.getMonth() + 1);
    return `<div class="bar-col"><div class="bar ${i===records.length-1?'active-bar':''}" style="height:${h}px" title="${r.weight}kg × ${r.reps}"></div><div class="bar-label">${label}</div></div>`;
  }).join('');
  const first = records[0], last = records[records.length - 1];
  const delta = Number(last.weight) - Number(first.weight);
  const deltaHTML = records.length > 1
    ? `<div class="evo-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}">${delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} ${Math.abs(delta)}kg desde ${new Date(first.date+'T00:00:00').toLocaleDateString('pt-BR')}</div>`
    : '';
  const listHTML = [...records].reverse().map(r =>
    `<div class="evo-history-row"><span class="evo-date">${new Date(r.date+'T00:00:00').toLocaleDateString('pt-BR')}</span><span class="evo-load">${r.weight}kg × ${r.reps} reps</span></div>`
  ).join('');
  return `
    <div class="section-title" style="margin-top:20px;margin-bottom:8px">Evolução de carga</div>
    <div class="chart-wrap">
      <div class="chart-title">Peso ao longo do tempo (kg)</div>
      <div class="bar-chart">${bars}</div>
      ${deltaHTML}
    </div>
    <div class="evo-history-list">${listHTML}</div>`;
}

function saveLibLoad(eid){
  const w = document.getElementById('lib-weight').value;
  const r = document.getElementById('lib-reps').value;
  if(!w && !r){ showToast('⚠️ Preencha peso ou reps'); return; }
  addLoadRecord(eid, w || 0, r || 0);
  showToast('💾 Carga registrada!');
  const ex = EXERCISES_DB.find(e => e.id === eid);
  if(ex) openExerciseModal(ex);
}
