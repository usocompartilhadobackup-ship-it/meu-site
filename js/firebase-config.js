// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyCkpYP6jtM9ToTkjcKr9uP6bY8tKnxbHTc",
  authDomain: "gyn-tracker.firebaseapp.com",
  projectId: "gyn-tracker",
  storageBucket: "gyn-tracker.firebasestorage.app",
  messagingSenderId: "82059461603",
  appId: "1:82059461603:web:966b270280378aaf20d6d6"
};
firebase.initializeApp(firebaseConfig);
const db  = firebase.firestore();
const auth = firebase.auth();

const ADMIN_EMAIL = 'emersonhconde@icloud.com';
const API_KEY     = firebaseConfig.apiKey;

const DEFAULT_STATE = {
  workouts:[], completedDays:[], totalWorkouts:0, totalMinutes:0,
  loadHistory:{}, notifEnabled:false, notifTime:'07:00',
  notifDays:[0,1,2,3,4], restDefault:60
};

// ── Cloud helpers ──────────────────────────────────────────────────────
function getUserId(){
  const user = auth.currentUser;
  return user ? user.uid : (localStorage.getItem('gymflow_uid') || 'anonymous');
}

async function saveToCloud(data){
  try{ await db.collection('users').doc(getUserId()).set(data); }
  catch(e){ console.warn('Firebase save failed:', e); }
}

async function loadFromCloud(){
  try{
    const doc = await db.collection('users').doc(getUserId()).get();
    if(doc.exists) return doc.data();
  } catch(e){ console.warn('Firebase load failed:', e); }
  return null;
}

// ── Auth state ─────────────────────────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
  if(!user){
    document.getElementById('splash').style.opacity = '0';
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').style.display    = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    return;
  }
  document.getElementById('login-screen').style.display = 'none';
  const cloudData = await loadFromCloud();
  if(cloudData){
    state = Object.assign({...DEFAULT_STATE}, cloudData);
    localStorage.setItem('gymflow_v3', JSON.stringify(state));
  }
  setTimeout(() => {
    document.getElementById('splash').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('app').style.display    = 'flex';
      initHome(); initPlanner(); initExercises(); initProgress(); initSettings();
    }, 500);
  }, 1400);
});
