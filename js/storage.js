// ==================== STORAGE: cópia local por usuário + sincronização com a nuvem ====================
// Toda alteração grava local e fica marcada como "pendente" até a nuvem confirmar.
// Assim uma versão antiga da nuvem nunca sobrescreve treinos feitos sem internet.
const LEGACY_KEYS = ['gymflow_v3', 'gymflow_uid'];
const stateKey = uid => 'gymflow_state_' + uid;
const dirtyKey = uid => 'gymflow_dirty_' + uid;

let saveSequence = 0;

function readLocalState(uid){
  try{ return JSON.parse(localStorage.getItem(stateKey(uid))); }
  catch(e){ return null; }
}

function userDoc(uid){ return db.collection('users').doc(uid); }

function setSyncStatus(status){
  const el = document.getElementById('sync-status');
  if(!el) return;
  const views = {
    saved:   ['cloud',     'Salvo na nuvem'],
    pending: ['cloud-off', 'Salvo no aparelho. Envia quando houver internet']
  };
  const [name, label] = views[status];
  el.dataset.status = status;
  el.innerHTML = icon(name) + `<span>${label}</span>`;
}

function hasPendingChanges(uid){ return localStorage.getItem(dirtyKey(uid)) === '1'; }

async function syncToCloud(){
  const user = auth.currentUser;
  if(!user) return;
  const sequence = ++saveSequence;
  try{
    await userDoc(user.uid).set(JSON.parse(JSON.stringify(state)));
    if(sequence === saveSequence){
      localStorage.removeItem(dirtyKey(user.uid));
      setSyncStatus('saved');
    }
  } catch(e){
    console.warn('Sincronização falhou:', e.code || e.message);
    setSyncStatus('pending');
  }
}

function save(){
  const user = auth.currentUser;
  if(!user) return;
  state.updatedAt = Date.now();
  localStorage.setItem(stateKey(user.uid), JSON.stringify(state));
  localStorage.setItem(dirtyKey(user.uid), '1');
  if(!navigator.onLine) setSyncStatus('pending');
  syncToCloud();
}

async function fetchCloudState(uid){
  try{
    const doc = await userDoc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch(e){
    console.warn('Leitura da nuvem falhou:', e.code || e.message);
    return null;
  }
}

async function loadUserState(uid){
  LEGACY_KEYS.forEach(k => localStorage.removeItem(k)); // cópia antiga não indicava de qual conta era
  const local   = readLocalState(uid);
  const pending = hasPendingChanges(uid);
  const cloud   = await fetchCloudState(uid);

  if(pending && local) state = cloud ? mergeStates(local, cloud) : Object.assign(createDefaultState(), local);
  else state = Object.assign(createDefaultState(), cloud || local || {});
  delete state.restDefault; // substituído por restOverride

  localStorage.setItem(stateKey(uid), JSON.stringify(state));
  if(pending) syncToCloud();
  else setSyncStatus('saved');
}

// Remove do aparelho os dados da conta ao sair (exceto o que ainda não foi enviado).
async function clearLocalUserData(uid){
  if(!hasPendingChanges(uid)) localStorage.removeItem(stateKey(uid));
  try{
    await db.terminate();
    await db.clearPersistence();
  } catch(e){
    console.warn('Não foi possível limpar o cache:', e.code || e.message);
  }
}

window.addEventListener('online', () => {
  const user = auth.currentUser;
  if(user && hasPendingChanges(user.uid)) syncToCloud();
});
window.addEventListener('offline', () => setSyncStatus('pending'));
