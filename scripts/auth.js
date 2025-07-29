// Système d'authentification StudyHub avec Firebase
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authOverlay = document.getElementById('auth-overlay');
    this.loginBtn = document.getElementById('login-btn');
    this.logoutBtn = document.getElementById('logout-btn');
    this.userInfo = document.getElementById('user-info');
    this.userName = document.getElementById('user-name');
    
    // Attendre que Firebase soit chargé
    this.waitForFirebase().then(() => {
      this.init();
    });
  }

  async waitForFirebase() {
    while (!window.Firebase) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  init() {
    this.setupEventListeners();
    this.setupAuthStateListener();
  }

  setupEventListeners() {
    // Boutons d'authentification
    this.loginBtn?.addEventListener('click', () => this.showAuthModal());
    this.logoutBtn?.addEventListener('click', () => this.logout());
    
    // Gestion des onglets d'authentification
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
    });
    
    // Formulaires d'authentification
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
    registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
    
    // Fermeture de la modal
    this.authOverlay?.addEventListener('click', (e) => {
      if (e.target === this.authOverlay) {
        this.hideAuthModal();
      }
    });
    
    // Boutons Google
    const googleBtns = document.querySelectorAll('.btn-google');
    googleBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleGoogleAuth());
    });
  }

  setupAuthStateListener() {
    const { auth } = window.Firebase;
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: user.metadata.creationTime
        };
        this.updateUI();
        await this.syncUserData();
        NotificationManager.show('Connexion réussie !', 'success');
      } else {
        this.currentUser = null;
        this.updateUI();
        NotificationManager.show('Déconnexion réussie', 'info');
      }
    });
  }

  showAuthModal() {
    this.authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideAuthModal() {
    this.authOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      await this.login(email, password);
      this.hideAuthModal();
    } catch (error) {
      NotificationManager.show('Erreur de connexion: ' + error.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
      NotificationManager.show('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    try {
      await this.register(name, email, password);
      this.hideAuthModal();
    } catch (error) {
      NotificationManager.show('Erreur d\'inscription: ' + error.message, 'error');
    }
  }

  async login(email, password) {
    const { auth, signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    return signInWithEmailAndPassword(auth, email, password);
  }

  async register(name, email, password) {
    const { auth, createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil avec le nom
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    return userCredential;
  }

  async handleGoogleAuth() {
    try {
      const { auth, GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
    } catch (error) {
      NotificationManager.show('Erreur d\'authentification Google: ' + error.message, 'error');
    }
  }

  async logout() {
    const { auth, signOut } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    await signOut(auth);
  }

  updateUI() {
    if (this.currentUser) {
      this.loginBtn?.classList.add('hidden');
      this.userInfo?.classList.remove('hidden');
      this.userName.textContent = this.currentUser.name;
      
      // Ajouter l'avatar si disponible
      if (this.currentUser.photoURL) {
        const avatar = document.getElementById('user-avatar');
        if (avatar) {
          avatar.src = this.currentUser.photoURL;
          avatar.style.display = 'block';
        }
      }
    } else {
      this.loginBtn?.classList.remove('hidden');
      this.userInfo?.classList.add('hidden');
      this.userName.textContent = '';
      
      const avatar = document.getElementById('user-avatar');
      if (avatar) {
        avatar.style.display = 'none';
      }
    }
  }

  async syncUserData() {
    if (!this.currentUser) return;
    
    try {
      const { db, doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      
      // Récupérer les données locales
      const localData = {
        subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
        qcm_data: JSON.parse(localStorage.getItem('qcm_data') || '{}'),
        qcm_results: JSON.parse(localStorage.getItem('qcm_results') || '{}'),
        flashcards: JSON.parse(localStorage.getItem('flashcards') || '{}'),
        resumes: JSON.parse(localStorage.getItem('resumes') || '{}'),
        imported_files: JSON.parse(localStorage.getItem('imported_files') || '[]'),
        chat_history: JSON.parse(localStorage.getItem('chat_history') || '{}'),
        lastSync: new Date().toISOString()
      };
      
      // Sauvegarder dans Firestore
      const userDocRef = doc(db, 'users', this.currentUser.id);
      await setDoc(userDocRef, localData, { merge: true });
      
      // Récupérer les données du cloud si elles existent
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const cloudData = userDoc.data();
        const lastLocalSync = localStorage.getItem('last_sync');
        
        // Synchroniser seulement si les données cloud sont plus récentes
        if (!lastLocalSync || cloudData.lastSync > lastLocalSync) {
          Object.keys(cloudData).forEach(key => {
            if (key !== 'lastSync') {
              localStorage.setItem(key, JSON.stringify(cloudData[key]));
            }
          });
          localStorage.setItem('last_sync', cloudData.lastSync);
        }
      }
      
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      NotificationManager.show('Erreur de synchronisation des données', 'error');
    }
  }

  async saveUserDataToCloud(data) {
    if (!this.currentUser) return;
    
    try {
      const { db, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      
      const userDocRef = doc(db, 'users', this.currentUser.id);
      await setDoc(userDocRef, {
        ...data,
        lastSync: new Date().toISOString()
      }, { merge: true });
      
    } catch (error) {
      console.error('Erreur de sauvegarde cloud:', error);
      NotificationManager.show('Erreur de sauvegarde cloud', 'error');
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async getUserData() {
    if (!this.currentUser) return null;
    
    try {
      const { db, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      
      const userDocRef = doc(db, 'users', this.currentUser.id);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }
}

// Initialiser le gestionnaire d'authentification
document.addEventListener('DOMContentLoaded', () => {
  window.AuthManager = new AuthManager();
});