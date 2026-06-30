// ==================== AUTH ====================
function showRegister(){
  document.getElementById('register-card').style.display = 'block';
  document.getElementById('login-error').style.display   = 'none';
  document.getElementById('login-email').closest('.lcard').querySelector('.lswitch').style.display = 'none';
  document.getElementById('login-btn').closest('.lcard').style.opacity = '.4';
  document.getElementById('register-name').focus();
}

function showLogin(){
  document.getElementById('register-card').style.display = 'none';
  document.getElementById('register-error').style.display = 'none';
  const loginCard = document.getElementById('login-btn').closest('.lcard');
  loginCard.style.opacity = '1';
  loginCard.querySelector('.lswitch').style.display = 'block';
}

async function doRegister(){
  const name    = document.getElementById('register-name').value.trim();
  const email   = document.getElementById('register-email').value.trim();
  const pass    = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const errEl   = document.getElementById('register-error');
  const btn     = document.getElementById('register-btn');
  errEl.style.display = 'none';

  if(!name){ errEl.textContent = 'Digite seu nome.'; errEl.style.display = 'block'; return; }
  if(!email){ errEl.textContent = 'Digite seu e-mail.'; errEl.style.display = 'block'; return; }
  if(pass.length < 6){ errEl.textContent = 'Senha mínimo 6 caracteres.'; errEl.style.display = 'block'; return; }
  if(pass !== confirm){ errEl.textContent = 'As senhas não conferem.'; errEl.style.display = 'block'; return; }

  btn.textContent = 'Criando...';
  btn.classList.add('lbtn-load');
  try{
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
  } catch(e){
    const msgs = {
      'auth/email-already-in-use' : 'E-mail já cadastrado.',
      'auth/invalid-email'        : 'E-mail inválido.',
      'auth/weak-password'        : 'Senha muito fraca.'
    };
    errEl.textContent = msgs[e.code] || 'Erro ao criar conta.';
    errEl.style.display = 'block';
  }
  btn.textContent = 'Criar Conta';
  btn.classList.remove('lbtn-load');
}

async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');
  errEl.style.display = 'none';
  if(!email || !pass){
    errEl.textContent = 'Preencha e-mail e senha.';
    errEl.style.display = 'block';
    return;
  }
  btn.textContent = 'Entrando...';
  btn.classList.add('lbtn-load');
  try{
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e){
    const msgs = {
      'auth/wrong-password'      : 'Senha incorreta.',
      'auth/user-not-found'      : 'Usuário não encontrado.',
      'auth/invalid-email'       : 'E-mail inválido.',
      'auth/invalid-credential'  : 'E-mail ou senha incorretos.',
      'auth/too-many-requests'   : 'Muitas tentativas. Tente mais tarde.'
    };
    errEl.textContent = msgs[e.code] || 'Erro ao entrar. Verifique suas credenciais.';
    errEl.style.display = 'block';
  }
  btn.textContent = 'Entrar';
  btn.classList.remove('lbtn-load');
}

function doLogout(){
  auth.signOut().then(() => {
    document.getElementById('app').style.display          = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-email').value          = '';
    document.getElementById('login-password').value       = '';
    document.getElementById('login-error').style.display  = 'none';
    showLogin();
    state = {...DEFAULT_STATE};
  });
}

// ── Admin: criar usuário demo ──────────────────────────────────────────
async function createDemoUser(){
  const email    = document.getElementById('new-user-email').value.trim();
  const password = document.getElementById('new-user-password').value;
  if(!email || !password){ showToast('⚠️ Preencha e-mail e senha'); return; }
  if(password.length < 6){ showToast('⚠️ Senha mínimo 6 caracteres'); return; }
  try{
    const res  = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email, password, returnSecureToken:true}) }
    );
    const data = await res.json();
    if(data.error){
      const m = {'EMAIL_EXISTS':'E-mail já cadastrado.','WEAK_PASSWORD':'Senha muito fraca.'};
      showToast('❌ ' + (m[data.error.message] || data.error.message));
      return;
    }
    const adminUid = auth.currentUser.uid;
    await db.collection('admin_created_users').doc(adminUid)
      .collection('users').doc(data.localId)
      .set({ email, createdAt: new Date().toISOString().split('T')[0] });
    document.getElementById('new-user-email').value    = '';
    document.getElementById('new-user-password').value = '';
    showToast('✅ Usuário criado: ' + email);
    loadCreatedUsers();
  } catch(e){ showToast('❌ Erro ao criar usuário'); }
}

async function loadCreatedUsers(){
  const list = document.getElementById('created-users-list');
  if(!list || !auth.currentUser) return;
  try{
    const snap = await db.collection('admin_created_users')
      .doc(auth.currentUser.uid).collection('users')
      .orderBy('createdAt','desc').get();
    if(snap.empty){
      list.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:12px 0">Nenhum usuário criado ainda</p>';
      return;
    }
    list.innerHTML =
      '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Usuários criados (' + snap.size + ')</div>' +
      snap.docs.map(d =>
        `<div class="user-chip">
          <span class="uc-email">📧 ${d.data().email}</span>
          <span class="uc-date">${d.data().createdAt}</span>
        </div>`
      ).join('');
  } catch(e){
    list.innerHTML = '<p style="color:var(--muted);font-size:13px">Erro ao carregar lista</p>';
  }
}

function openAdminPanel(){
  loadCreatedUsers();
  document.getElementById('admin-modal').classList.add('open');
}
