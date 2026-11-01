// ==================== PLANNER ====================
let plannerDay = mondayIndex();
let pickerSelected = new Set();
let editingDay = null;

function initPlanner(){
  document.getElementById('day-selector').innerHTML = WEEKDAY_LONG.map((d, i) =>
    `<button type="button" class="day-tab ${i === plannerDay ? 'active' : ''}" data-action="selectPlannerDay" data-day="${i}" aria-pressed="${i === plannerDay}">${d}</button>`
  ).join('');
  renderPlanContent();
}

ACTIONS.selectPlannerDay = (el) => {
  plannerDay = Number(el.dataset.day);
  initPlanner();
};

function renderPlanContent(){
  const cont    = document.getElementById('plan-content');
  const workout = state.workouts.find(w => w.day === plannerDay);
  if(!workout){
    cont.innerHTML = `<div class="empty-state">
      ${icon('moon', 'empty-icon')}
      <p>Nenhum treino na ${WEEKDAY_LONG[plannerDay].toLowerCase()}.</p>
      <button type="button" class="btn-primary" data-action="openAddWorkout">${icon('plus')}Criar treino</button>
    </div>`;
    return;
  }
  cont.innerHTML = `<div class="plan-slot">
    <div class="slot-header">
      <h2>${escapeHtml(workout.name)}</h2>
      <div class="slot-actions">
        <button type="button" class="icon-btn" data-action="openEditWorkout" aria-label="Editar treino">${icon('edit')}</button>
        <button type="button" class="icon-btn icon-btn-danger" data-action="deleteWorkout" aria-label="Excluir treino">${icon('trash')}</button>
      </div>
    </div>
    ${workout.exercises.map(eid => {
      const ex = findExercise(eid);
      if(!ex) return '';
      return `<div class="exercise-row">${makeThumb(ex)}<div class="ex-info"><h3>${escapeHtml(ex.name)}</h3><p>${escapeHtml(ex.sets)} · ${escapeHtml(ex.muscle)}</p></div></div>`;
    }).join('')}
  </div>`;
}

function openWorkoutForm(workout){
  editingDay = workout ? workout.day : null;
  document.getElementById('add-modal-title').textContent = workout ? 'Editar treino' : 'Criar treino';
  document.getElementById('new-workout-name').value = workout ? workout.name : '';
  document.getElementById('new-workout-day').value  = workout ? workout.day : plannerDay;
  pickerSelected = new Set(workout ? workout.exercises : []);
  renderExPicker();
  openModal('add-modal');
}

ACTIONS.openAddWorkout  = () => openWorkoutForm(null);
ACTIONS.openEditWorkout = () => openWorkoutForm(state.workouts.find(w => w.day === plannerDay));

function renderExPicker(){
  document.getElementById('ex-picker').innerHTML = PICKER_GROUPS.map((group, index) => {
    const exercises = EXERCISES_DB.filter(e => pickerCategoryOf(e) === group);
    const selected  = exercises.filter(e => pickerSelected.has(e.id)).length;
    const open      = selected > 0 || (index === 0 && pickerSelected.size === 0);
    return `<div class="picker-group ${open ? 'open' : ''}">
      <button type="button" class="picker-group-header" data-action="togglePickerGroup" aria-expanded="${open}">
        <span>${group}</span>
        <span class="picker-group-meta">
          <span class="picker-count ${selected ? '' : 'zero'}" data-group-count="${group}">${selected}</span>
          ${icon('chevron', 'picker-chevron')}
        </span>
      </button>
      <div class="picker-group-body">
        ${exercises.map(ex => {
          const isSelected = pickerSelected.has(ex.id);
          return `<button type="button" class="picker-item ${isSelected ? 'selected' : ''}" data-action="togglePickerEx" data-eid="${ex.id}" data-group="${group}" aria-pressed="${isSelected}">
            ${makeThumb(ex)}
            <span class="ex-info"><strong>${escapeHtml(ex.name)}</strong><small>${escapeHtml(ex.sets)} · ${escapeHtml(ex.muscle)}</small></span>
            <span class="picker-check">${icon('check')}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
  updatePickerSummary();
}

ACTIONS.togglePickerGroup = (el) => {
  const open = el.parentElement.classList.toggle('open');
  el.setAttribute('aria-expanded', open);
};

ACTIONS.togglePickerEx = (el) => {
  const { eid, group } = el.dataset;
  if(pickerSelected.has(eid)) pickerSelected.delete(eid);
  else pickerSelected.add(eid);
  const isSelected = pickerSelected.has(eid);
  el.classList.toggle('selected', isSelected);
  el.setAttribute('aria-pressed', isSelected);
  const count = EXERCISES_DB.filter(e => pickerCategoryOf(e) === group && pickerSelected.has(e.id)).length;
  const badge = document.querySelector(`[data-group-count="${group}"]`);
  badge.textContent = count;
  badge.classList.toggle('zero', count === 0);
  updatePickerSummary();
};

function updatePickerSummary(){
  const n = pickerSelected.size;
  document.getElementById('picker-summary').textContent = n === 0
    ? 'Nenhum exercício selecionado'
    : `${n} ${plural(n, 'exercício selecionado', 'exercícios selecionados')}`;
}

ACTIONS.saveWorkout = async () => {
  const nameInput = document.getElementById('new-workout-name');
  const name      = nameInput.value.trim();
  const day       = Number(document.getElementById('new-workout-day').value);
  const exercises = [...pickerSelected];
  if(!name){ showToast('Dê um nome ao treino', 'error'); nameInput.focus(); return; }
  if(!exercises.length){ showToast('Selecione ao menos 1 exercício', 'error'); return; }

  const conflict = state.workouts.find(w => w.day === day && w.day !== editingDay);
  if(conflict){
    const replace = await confirmDialog({
      title: 'Substituir treino?',
      message: `${WEEKDAY_LONG[day]} já tem o treino "${conflict.name}". Ele será substituído.`,
      confirmLabel: 'Substituir',
      danger: true
    });
    if(!replace) return;
  }

  state.workouts = state.workouts.filter(w => w.day !== day && w.day !== editingDay);
  state.workouts.push({ day, name, exercises });
  save();
  plannerDay = day;
  closeModal('add-modal');
  initPlanner();
  initHome();
  showToast('Treino salvo');
};

ACTIONS.deleteWorkout = async () => {
  const workout = state.workouts.find(w => w.day === plannerDay);
  if(!workout) return;
  const confirmed = await confirmDialog({
    title: 'Excluir treino?',
    message: `"${workout.name}" sairá do seu plano. O histórico de cargas é mantido.`,
    confirmLabel: 'Excluir',
    danger: true
  });
  if(!confirmed) return;
  state.workouts = state.workouts.filter(w => w.day !== plannerDay);
  save();
  renderPlanContent();
  initHome();
  showToast('Treino excluído');
};
