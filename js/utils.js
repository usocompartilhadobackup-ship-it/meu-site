// ==================== UTILS (funções puras, cobertas por tests/utils.test.js) ====================
const HTML_ESCAPES = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };

// Todo dado dinâmico inserido via innerHTML precisa passar por aqui.
function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}

function icon(name, cls){
  return `<svg class="icon ${cls || ''}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

// ── Datas: sempre no fuso local. toISOString() converte para UTC e muda o dia à noite no Brasil.
function toDateKey(date = new Date()){
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function parseDateKey(key){
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKey(key){ return parseDateKey(key).toLocaleDateString('pt-BR'); }

// 0 = segunda ... 6 = domingo
function mondayIndex(date = new Date()){ return (date.getDay() + 6) % 7; }

function weekDateKeys(date = new Date(), weeksAgo = 0){
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayIndex(date) - weeksAgo * 7);
  return Array.from({ length: 7 }, (_, i) =>
    toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)));
}

// A sequência segue valendo no dia em que o treino de hoje ainda não aconteceu.
function computeStreak(completedDays, today = new Date()){
  const done = new Set(completedDays);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if(!done.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while(done.has(toDateKey(cursor))){
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatClock(totalSeconds){
  const safe = Math.max(0, totalSeconds);
  return String(Math.floor(safe / 60)).padStart(2, '0') + ':' + String(safe % 60).padStart(2, '0');
}

// ── Séries ──────────────────────────────────────────────────────────────
function parseSetScheme(scheme){
  const [count, reps] = String(scheme).split('x').map(Number);
  return { count: count || 3, reps: reps || 10 };
}

function bestSet(sets){
  return sets.reduce((best, s) => (Number(s.weight) || 0) >= (Number(best.weight) || 0) ? s : best, sets[0]);
}

// ── Estado ──────────────────────────────────────────────────────────────
function createDefaultState(){
  return {
    workouts: [], completedDays: [], totalWorkouts: 0, totalMinutes: 0,
    loadHistory: {}, notifEnabled: false, notifTime: '07:00',
    notifDays: [0, 1, 2, 3, 4], restOverride: 0, updatedAt: 0
  };
}

function normalizeHistory(entry){
  if(!entry) return [];
  return Array.isArray(entry) ? entry : [entry]; // saves antigos guardavam um único objeto
}

// Une alterações feitas offline com a nuvem sem perder registros de nenhum lado.
function mergeStates(local, cloud){
  const merged = Object.assign(createDefaultState(), cloud, local);
  merged.completedDays = [...new Set([...(cloud.completedDays || []), ...(local.completedDays || [])])].sort();
  merged.totalWorkouts = Math.max(cloud.totalWorkouts || 0, local.totalWorkouts || 0);
  merged.totalMinutes  = Math.max(cloud.totalMinutes  || 0, local.totalMinutes  || 0);
  merged.updatedAt     = Math.max(cloud.updatedAt     || 0, local.updatedAt     || 0);
  merged.loadHistory   = {};
  const ids = new Set([...Object.keys(cloud.loadHistory || {}), ...Object.keys(local.loadHistory || {})]);
  ids.forEach(id => {
    const byDate = new Map();
    normalizeHistory((cloud.loadHistory || {})[id]).forEach(r => byDate.set(r.date, r));
    normalizeHistory((local.loadHistory || {})[id]).forEach(r => byDate.set(r.date, r));
    merged.loadHistory[id] = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  });
  return merged;
}
