// ==================== AUTH ====================
const MIN_PASSWORD_LENGTH = 8;
const MIN_SPLASH_MS = 700;

// Mensagem única para e-mail e senha: não revela quais e-mails têm conta.
const LOGIN_ERRORS = {
  'auth/invalid-email'      : 'Confira o e-mail digitado.',
  'auth/too-many-requests'  : 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente de novo.'
};
const REGISTER_ERRORS = {
  'auth/email-already-in-use': 'Não foi possível criar a conta com este e-mail. Tente entrar.',
  'auth/invalid-email'       : 'Confira o e-mail digitado.',
  'auth/weak-password'       : 'Escolha uma senha mais forte.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente de novo.'
};

function showFormError(id, message){
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.toggle('visible', !!message);
}

function setButtonLoading(btn, loading){
  btn.classList.toggle('btn-loading', loading);
  btn.disabled = loading;
}

ACTIONS.togglePassword = (btn) => {
  const input = document.getElementById(btn.dataset.target);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
};

ACTIONS.showRegister = () => {
  document.getElementById('login-card').hidden = true;
  document.getElementById('register-card').hidden = false;
  showFormError('register-error', '');
  document.getElementById('register-name').focus();
};

ACTIONS.showLogin = () => {
  document.getElementById('register-card').hidden = true;
  document.getElementById('login-card').hidden = false;
  showFormError('login-error', '');
  document.getElementById('login-email').focus();
};

ACTIONS.doRegister = async () => {
  const name    = document.getElementById('register-name').value.trim();
  const email   = document.getElementById('register-email').value.trim();
  const pass    = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const btn     = document.getElementById('register-btn');
  showFormError('register-error', '');

  if(!name) return showFormError('register-error', 'Digite seu nome.');
  if(!email) return showFormError('register-error', 'Digite seu e-mail.');
  if(pass.length < MIN_PASSWORD_LENGTH) return showFormError('register-error', `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  if(pass !== confirm) return showFormError('register-error', 'As senhas não são iguais.');

  setButtonLoading(btn, true);
  try{
    const credential = await auth.createUserWithEmailAndPassword(email, pass);
    await credential.user.updateProfile({ displayName: name });
    renderHeader();
  } catch(e){
    showFormError('register-error', REGISTER_ERRORS[e.code] || 'Não foi possível criar a conta. Tente de novo.');
  }
  setButtonLoading(btn, false);
};

ACTIONS.doLogin = async () => {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  const btn   = document.getElementById('login-btn');
  showFormError('login-error', '');
  if(!email || !pass) return showFormError('login-error', 'Preencha e-mail e senha.');

  setButtonLoading(btn, true);
  try{
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e){
    showFormError('login-error', LOGIN_ERRORS[e.code] || 'E-mail ou senha incorretos.');
  }
  setButtonLoading(btn, false);
};

ACTIONS.doLogout = async () => {
  const user = auth.currentUser;
  const pending = user && hasPendingChanges(user.uid);
  const confirmed = await confirmDialog({
    title: 'Sair da conta?',
    message: pending
      ? 'Há treinos ainda não enviados. Eles ficam neste aparelho e sobem no próximo login com internet.'
      : 'Seus dados ficam salvos na nuvem e serão removidos deste aparelho.',
    confirmLabel: 'Sair',
    danger: true
  });
  if(!confirmed) return;
  const uid = user.uid;
  await auth.signOut();
  await clearLocalUserData(uid);
  window.location.reload(); // descarta da memória todo o estado da conta
};

// ── Admin ──────────────────────────────────────────────────────────────
// A permissão vem do documento admins/{uid}, validado pelas regras do Firestore.
async function showAdminSectionIfAllowed(){
  let allowed = false;
  try{
    allowed = (await db.collection('admins').doc(auth.currentUser.uid).get()).exists;
  } catch(e){
    allowed = false;
  }
  document.getElementById('admin-section').hidden = !allowed;
}

function managedUsersCollection(){
  return db.collection('admin_created_users').doc(auth.currentUser.uid).collection('users');
}

ACTIONS.createManagedUser = async () => {
  const emailInput = document.getElementById('new-user-email');
  const passInput  = document.getElementById('new-user-password');
  const btn        = document.getElementById('new-user-btn');
  const email = emailInput.value.trim();
  const password = passInput.value;
  if(!email){ showToast('Preencha o e-mail', 'error'); return; }
  if(password.length < MIN_PASSWORD_LENGTH){ showToast(`A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`, 'error'); return; }

  setButtonLoading(btn, true);
  // App secundário: criar a conta nele não desconecta o admin.
  const secondary = firebase.initializeApp(firebaseConfig, 'user-creation');
  try{
    const { user } = await secondary.auth().createUserWithEmailAndPassword(email, password);
    await secondary.auth().signOut();
    await managedUsersCollection().doc(user.uid).set({ email, createdAt: toDateKey() });
    emailInput.value = '';
    passInput.value = '';
    showToast('Usuário criado');
    loadCreatedUsers();
  } catch(e){
    showToast(REGISTER_ERRORS[e.code] || 'Não foi possível criar o usuário', 'error');
  } finally {
    await secondary.delete();
    setButtonLoading(btn, false);
  }
};

async function loadCreatedUsers(){
  const list = document.getElementById('created-users-list');
  try{
    const snapshot = await managedUsersCollection().orderBy('createdAt', 'desc').get();
    list.innerHTML = snapshot.empty
      ? '<p class="muted-text">Nenhum usuário criado ainda.</p>'
      : `<p class="card-label">Usuários criados (${snapshot.size})</p>` + snapshot.docs.map(d =>
          `<div class="user-chip"><span>${escapeHtml(d.data().email)}</span><small>${formatDateKey(d.data().createdAt)}</small></div>`).join('');
  } catch(e){
    list.innerHTML = '<p class="muted-text">Não foi possível carregar a lista.</p>';
  }
}

ACTIONS.openAdminPanel = () => {
  loadCreatedUsers();
  openModal('admin-modal');
};

// ── Estado de autenticação ─────────────────────────────────────────────
function hideSplash(){
  const splash = document.getElementById('splash');
  splash.classList.add('hidden');
  setTimeout(() => { splash.style.display = 'none'; }, 300);
}

auth.onAuthStateChanged(async (user) => {
  if(!user){
    state = createDefaultState();
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    hideSplash();
    return;
  }
  document.getElementById('login-screen').style.display = 'none';
  const started = Date.now();
  await loadUserState(user.uid);
  setTimeout(() => {
    document.getElementById('app').style.display = 'flex';
    initHome(); initPlanner(); initExercises(); initProgress(); initSettings();
    hideSplash();
  }, Math.max(0, MIN_SPLASH_MS - (Date.now() - started)));
});
