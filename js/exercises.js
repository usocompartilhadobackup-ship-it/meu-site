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
  const hist     = state.loadHistory[ex.id];
  const histHTML = hist
    ? `<div class="load-history">Último registro: <span>${hist.weight}kg × ${hist.reps} reps</span> — ${hist.date}</div>`
    : '';
  const badge = GROUP_BADGE[ex.group] || 'badge-core';
  document.getElementById('modal-workout-body').innerHTML = `
    <div class="ex-detail-img">
      <img src="${imgSrc(ex.img)}" alt="${ex.name}"
        onerror="if(this.src.endsWith('.gif')){this.src=this.src.replace('.gif','.svg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
      <div class="ex-detail-fallback">${ex.icon}</div>
    </div>
    ${ex.tip ? `<div class="ex-tip-card"><div class="tip-label">⚡ Dica de execução</div><p>${ex.tip}</p></div>` : ''}
    <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Registrar carga</div>
    <div class="load-row">
      <div class="load-input-wrap"><div class="load-label">Peso (kg)</div><input class="load-input" id="lib-weight" type="number" placeholder="0" inputmode="decimal" value="${hist?hist.weight:''}"></div>
      <div class="load-input-wrap"><div class="load-label">Repetições</div><input class="load-input" id="lib-reps" type="number" placeholder="0" inputmode="numeric" value="${hist?hist.reps:''}"></div>
    </div>
    ${histHTML}
    <button class="btn-primary" style="margin-top:14px" onclick="saveLibLoad('${ex.id}')">💾 Salvar registro</button>`;
  document.getElementById('workout-modal').classList.add('open');
}

function saveLibLoad(eid){
  const w = document.getElementById('lib-weight').value;
  const r = document.getElementById('lib-reps').value;
  if(!w && !r){ showToast('⚠️ Preencha peso ou reps'); return; }
  state.loadHistory[eid] = { weight:w||0, reps:r||0, date:new Date().toISOString().split('T')[0] };
  save();
  document.getElementById('workout-modal').classList.remove('open');
  showToast('💾 Carga registrada!');
}
