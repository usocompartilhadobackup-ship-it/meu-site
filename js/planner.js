// ==================== PLANNER ====================
function initPlanner(){
  const days = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const sel  = document.getElementById('day-selector'); sel.innerHTML = '';
  days.forEach((d, i) => {
    const tab = document.createElement('div');
    tab.className = 'day-tab' + (i === plannerDay ? ' active' : '');
    tab.textContent = d;
    tab.onclick = () => {
      plannerDay = i;
      document.querySelectorAll('.day-tab').forEach((t, j) => t.className = 'day-tab' + (j === i ? ' active' : ''));
      renderPlanContent();
    };
    sel.appendChild(tab);
  });
  renderPlanContent();
}

function renderPlanContent(){
  const cont    = document.getElementById('plan-content');
  const workout = state.workouts.find(w => w.day === plannerDay);
  if(!workout){
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">🌌</div><p>Nenhum treino para este dia.<br>Crie um treino abaixo!</p></div>`;
    return;
  }
  cont.innerHTML = `<div class="plan-slot">
    <div class="slot-header">
      <h4>${workout.name}</h4>
      <button class="btn-danger" onclick="deleteWorkout(${workout.day})">Excluir</button>
    </div>
    ${workout.exercises.map(eid => {
      const ex = EXERCISES_DB.find(e => e.id === eid); if(!ex) return '';
      return `<div class="exercise-item">${makeThumb(ex.img,ex.icon,52)}<div class="ex-info"><h5>${ex.name}</h5><p>${ex.sets} • ${ex.muscle}</p></div></div>`;
    }).join('')}
  </div>`;
}

let pickerSelected = new Set();

function openAddWorkout(){
  document.getElementById('new-workout-name').value = '';
  document.getElementById('new-workout-day').value  = plannerDay;
  pickerSelected = new Set();
  renderExPicker();
  document.getElementById('add-modal').classList.add('open');
}

function renderExPicker(){
  const picker = document.getElementById('ex-picker'); picker.innerHTML = '';
  PICKER_GROUPS.forEach((g, gi) => {
    const exs      = EXERCISES_DB.filter(e => pickerCategoryOf(e) === g.key);
    if(!exs.length) return;
    const selCount = exs.filter(e => pickerSelected.has(e.id)).length;
    const group    = document.createElement('div');
    group.className = 'picker-group' + (gi === 0 ? ' open' : '');
    group.id = 'pg-' + g.key;
    group.innerHTML = `
      <div class="picker-group-header" onclick="togglePickerGroup('${g.key}')">
        <div class="picker-group-title"><span class="picker-group-icon">${g.icon}</span>${g.label}</div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="picker-group-count ${selCount===0?'zero':''}" id="pgc-${g.key}">${selCount}</span>
          <span class="picker-group-chevron">▾</span>
        </div>
      </div>
      <div class="picker-group-body">
        <div class="picker-ex-list">
          ${exs.map(ex => `
            <div class="picker-ex-item ${pickerSelected.has(ex.id)?'selected':''}" id="pei-${ex.id}" onclick="togglePickerEx('${ex.id}','${g.key}')">
              <div class="picker-ex-thumb">
                <img src="${imgSrc(ex.img)}" alt="" onerror="if(this.src.endsWith('.gif')){this.src=this.src.replace('.gif','.svg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
                <div class="picker-ex-thumb-fallback" style="display:none">${ex.icon}</div>
              </div>
              <div class="picker-ex-info"><h6>${ex.name}</h6><p>${ex.sets} • ${ex.muscle}</p></div>
              <div class="picker-ex-check">${pickerSelected.has(ex.id)?'✓':''}</div>
            </div>`).join('')}
        </div>
      </div>`;
    picker.appendChild(group);
  });
  updatePickerSummary();
}

function togglePickerGroup(key){ document.getElementById('pg-' + key).classList.toggle('open'); }

function togglePickerEx(eid, groupKey){
  if(pickerSelected.has(eid)) pickerSelected.delete(eid); else pickerSelected.add(eid);
  const item   = document.getElementById('pei-' + eid);
  const isSel  = pickerSelected.has(eid);
  item.classList.toggle('selected', isSel);
  item.querySelector('.picker-ex-check').textContent = isSel ? '✓' : '';
  const exs      = EXERCISES_DB.filter(e => pickerCategoryOf(e) === groupKey);
  const selCount = exs.filter(e => pickerSelected.has(e.id)).length;
  const countEl  = document.getElementById('pgc-' + groupKey);
  countEl.textContent = selCount;
  countEl.classList.toggle('zero', selCount === 0);
  updatePickerSummary();
}

function updatePickerSummary(){
  const n = pickerSelected.size;
  document.getElementById('picker-summary').innerHTML = n === 0
    ? 'Nenhum exercício selecionado'
    : `<strong>${n}</strong> exercício${n>1?'s':''} selecionado${n>1?'s':''}`;
}

function saveWorkout(){
  const name     = document.getElementById('new-workout-name').value.trim();
  const day      = parseInt(document.getElementById('new-workout-day').value);
  const selected = [...pickerSelected];
  if(!name){ showToast('⚠️ Dê um nome ao treino'); return; }
  if(!selected.length){ showToast('⚠️ Selecione ao menos 1 exercício'); return; }
  state.workouts = state.workouts.filter(w => w.day !== day);
  state.workouts.push({ day, name, exercises: selected });
  save();
  document.getElementById('add-modal').classList.remove('open');
  initPlanner(); initHome();
  showToast('✅ Treino salvo!');
}

function deleteWorkout(day){
  state.workouts = state.workouts.filter(w => w.day !== day);
  save(); renderPlanContent(); initHome();
  showToast('🗑️ Treino excluído');
}
