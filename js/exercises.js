// ==================== EXERCISE LIBRARY ====================
const EVOLUTION_CHART_POINTS = 12;
let filterGroup = 'Todos';

function initExercises(){
  document.getElementById('muscle-filter').innerHTML = GROUPS.map(g =>
    `<button type="button" class="chip ${g === filterGroup ? 'selected' : ''}" data-action="filterGroup" data-group="${g}" aria-pressed="${g === filterGroup}">${g}</button>`
  ).join('');
  renderExerciseGrid();
}

ACTIONS.filterGroup = (el) => {
  filterGroup = el.dataset.group;
  initExercises();
};

ACTIONS.filterExercises = () => renderExerciseGrid();

function renderExerciseGrid(){
  const query = document.getElementById('ex-search').value.trim().toLowerCase();
  const list  = document.getElementById('exercise-library');
  const filtered = EXERCISES_DB.filter(e =>
    (filterGroup === 'Todos' || e.group === filterGroup) &&
    (!query || e.name.toLowerCase().includes(query) || e.muscle.toLowerCase().includes(query)));
  if(!filtered.length){
    list.innerHTML = `<div class="empty-state grid-span">${icon('search', 'empty-icon')}<p>Nenhum exercício encontrado. Tente outro termo ou grupo.</p></div>`;
    return;
  }
  list.innerHTML = filtered.map(ex => `
    <button type="button" class="ex-card" data-action="openExercise" data-eid="${ex.id}">
      <span class="ex-card-img">${exerciseImg(ex)}</span>
      <span class="ex-card-info">
        <strong>${escapeHtml(ex.name)}</strong>
        <small>${escapeHtml(ex.muscle)}</small>
        <span class="badge ${GROUP_BADGE[ex.group] || 'badge-core'}">${escapeHtml(ex.sets)}</span>
      </span>
    </button>`).join('');
}

ACTIONS.openExercise = (el) => {
  const ex = findExercise(el.dataset.eid);
  if(ex) renderExerciseModal(ex, true);
};

function renderExerciseModal(ex, shouldOpen){
  document.getElementById('exercise-modal-title').textContent = ex.name;
  document.getElementById('exercise-modal-meta').textContent  = `${ex.muscle} · ${ex.sets} · ${ex.rest}s de descanso`;
  const last = getLastRecord(ex.id);
  document.getElementById('exercise-modal-body').innerHTML = `
    <button type="button" class="ex-detail-img" data-action="openGifLightbox" data-eid="${ex.id}" aria-label="Ampliar demonstração">
      ${exerciseImg(ex, false)}
      <span class="expand-badge">${icon('expand')}</span>
    </button>
    <div class="tip-card"><p class="card-label">Dica de execução</p><p>${escapeHtml(ex.tip)}</p></div>
    <h3 class="section-title">Registrar carga de hoje</h3>
    <form data-submit="saveLibraryLoad" data-eid="${ex.id}" novalidate>
      <div class="load-row">
        <div><label class="form-label" for="lib-weight">Peso (kg)</label><input class="form-input" id="lib-weight" type="number" min="0" step="0.5" inputmode="decimal" value="${last ? escapeHtml(last.weight) : ''}"></div>
        <div><label class="form-label" for="lib-reps">Repetições</label><input class="form-input" id="lib-reps" type="number" min="0" inputmode="numeric" value="${last ? escapeHtml(last.reps) : ''}"></div>
      </div>
      <button type="submit" class="btn-primary">Salvar registro</button>
    </form>
    ${renderEvolutionSection(ex.id)}`;
  if(shouldOpen) openModal('exercise-modal');
}

function formatSets(record){
  return recordSets(record).map(s => `${escapeHtml(s.weight)}kg × ${escapeHtml(s.reps)}`).join(' · ');
}

function renderEvolutionSection(eid){
  const records = getSortedHistory(eid);
  if(!records.length){
    return `<h3 class="section-title section-spaced">Evolução de carga</h3>
      <div class="empty-state">${icon('chart', 'empty-icon')}<p>Registre sua primeira carga para acompanhar a evolução neste exercício.</p></div>`;
  }
  const recent = records.slice(-EVOLUTION_CHART_POINTS);
  const max    = Math.max(...recent.map(r => Number(r.weight) || 0), 1);
  const bars   = recent.map((r, i) => {
    const height = Math.max(6, Math.round((Number(r.weight) / max) * 100));
    const date   = parseDateKey(r.date);
    return `<div class="bar-col"><span class="bar-value">${escapeHtml(r.weight)}</span><div class="bar ${i === recent.length - 1 ? 'active-bar' : ''}" style="height:${height}%"></div><span class="bar-label">${date.getDate()}/${date.getMonth() + 1}</span></div>`;
  }).join('');
  const first = records[0], last = records[records.length - 1];
  const delta = Number(last.weight) - Number(first.weight);
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
  const deltaText = delta > 0 ? `+${delta}kg` : delta < 0 ? `${delta}kg` : 'Mesma carga';
  const summary = records.length > 1
    ? `<p class="evo-delta ${direction}">${deltaText} desde ${formatDateKey(first.date)}</p>` : '';
  const rows = [...records].reverse().map(r =>
    `<li class="evo-row"><span>${formatDateKey(r.date)}</span><strong>${formatSets(r)}</strong></li>`).join('');
  return `
    <h3 class="section-title section-spaced">Evolução de carga</h3>
    <div class="card">
      <p class="card-label">Melhor série por dia (kg)</p>
      <div class="bar-chart" role="img" aria-label="Carga mais recente: ${escapeHtml(last.weight)} quilos">${bars}</div>
      ${summary}
    </div>
    <ul class="evo-list">${rows}</ul>`;
}

ACTIONS.saveLibraryLoad = (form) => {
  const weight = document.getElementById('lib-weight').value;
  const reps   = document.getElementById('lib-reps').value;
  if(!weight && !reps){ showToast('Preencha o peso ou as repetições', 'error'); return; }
  saveLoadRecord(form.dataset.eid, [{ weight: Number(weight) || 0, reps: Number(reps) || 0 }]);
  showToast('Carga registrada');
  const ex = findExercise(form.dataset.eid);
  if(ex) renderExerciseModal(ex, false);
};
