// ==================== FIREBASE ====================
// A configuração web do Firebase identifica o projeto e é pública por natureza: todo
// navegador precisa dela. Quem protege os dados são as regras em firestore.rules.
// Veja "Segurança" no README para restringir a chave no Google Cloud.
const firebaseConfig = {
  apiKey: "AIzaSyCkpYP6jtM9ToTkjcKr9uP6bY8tKnxbHTc",
  authDomain: "gyn-tracker.firebaseapp.com",
  projectId: "gyn-tracker",
  storageBucket: "gyn-tracker.firebasestorage.app",
  messagingSenderId: "82059461603",
  appId: "1:82059461603:web:966b270280378aaf20d6d6"
};
firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

// Mantém dados e escritas pendentes entre aberturas do app, mesmo sem internet.
db.enablePersistence({ synchronizeTabs: true })
  .catch(e => console.warn('Cache offline indisponível:', e.code));
