# 🚀 Guide d'Installation Rapide - StudyHub

## 📋 Prérequis

- **Navigateur moderne** : Chrome, Firefox, Safari, Edge (dernière version)
- **Connexion Internet** : Pour Firebase et OpenAI (optionnel)
- **Serveur web** : Apache, Nginx, ou serveur local (recommandé)

## ⚡ Installation Express (5 minutes)

### 1. **Décompression**
```bash
# Décompresser le fichier ZIP
unzip StudyHub_Final_Complete.zip
cd StudyHub_Final_Complete
```

### 2. **Configuration Firebase (Optionnel)**
```javascript
// Éditer config.js
window.StudyHubConfig = {
  firebase: {
    apiKey: "VOTRE_CLE_API",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
  }
};
```

### 3. **Configuration OpenAI (Optionnel)**
```javascript
// Éditer ai-config.js
window.AIConfig = {
  openai: {
    apiKey: "VOTRE_CLE_OPENAI", // Optionnel
    model: 'gpt-3.5-turbo'
  }
};
```

### 4. **Démarrage**
```bash
# Méthode 1 : Serveur local Python
python -m http.server 8000

# Méthode 2 : Serveur local Node.js
npx http-server

# Méthode 3 : Ouverture directe
# Ouvrir index.html dans le navigateur
```

### 5. **Accès**
```
http://localhost:8000
```

## 🔧 Configuration Détaillée

### **Firebase Setup**

1. **Créer un projet Firebase**
   - Aller sur [console.firebase.google.com](https://console.firebase.google.com)
   - Créer un nouveau projet
   - Activer Authentication et Firestore

2. **Configurer l'authentification**
   - Aller dans Authentication > Sign-in method
   - Activer Email/Password et Google
   - Configurer les domaines autorisés

3. **Configurer Firestore**
   - Aller dans Firestore Database
   - Créer une base de données en mode test
   - Configurer les règles de sécurité

4. **Récupérer la configuration**
   - Aller dans Project Settings
   - Ajouter une application web
   - Copier la configuration

### **OpenAI Setup (Optionnel)**

1. **Créer un compte OpenAI**
   - Aller sur [platform.openai.com](https://platform.openai.com)
   - Créer un compte et vérifier l'email

2. **Générer une clé API**
   - Aller dans API Keys
   - Créer une nouvelle clé
   - Copier la clé (gardez-la secrète !)

3. **Configurer les quotas**
   - Définir des limites d'usage
   - Surveiller la consommation

## 🎯 Fonctionnalités Disponibles

### **Sans Configuration (Mode Local)**
- ✅ Import de documents PDF/Word
- ✅ Génération de contenu simulé
- ✅ Flashcards et QCM basiques
- ✅ Interface complète
- ✅ Thème clair/sombre

### **Avec Firebase (Mode Cloud)**
- ✅ Authentification complète
- ✅ Synchronisation des données
- ✅ Sauvegarde automatique
- ✅ Collaboration multi-appareils

### **Avec OpenAI (Mode IA)**
- ✅ Analyse intelligente de contenu
- ✅ Génération de contenu avancée
- ✅ Plans d'étude personnalisés
- ✅ Assistant IA conversationnel

## 🚀 Déploiement Production

### **Firebase Hosting (Recommandé)**

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser le projet
firebase init hosting

# Déployer
firebase deploy
```

### **Autres Plateformes**

#### **Netlify**
```bash
# Déployer depuis le dossier
netlify deploy --dir=.

# Ou connecter un repository Git
```

#### **Vercel**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

#### **GitHub Pages**
```bash
# Pousser vers un repository GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/user/repo.git
git push -u origin main

# Activer GitHub Pages dans les settings
```

## 🔒 Sécurité

### **Variables d'Environnement**
```bash
# Créer un fichier .env (optionnel)
OPENAI_API_KEY=votre_cle_openai
FIREBASE_API_KEY=votre_cle_firebase
```

### **Règles Firestore**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🐛 Dépannage

### **Problèmes Courants**

#### **Erreur CORS**
```
Solution : Utiliser un serveur web local au lieu d'ouvrir directement le fichier HTML
```

#### **Firebase non connecté**
```
Solution : Vérifier la configuration dans config.js
```

#### **IA non fonctionnelle**
```
Solution : Vérifier la clé OpenAI dans ai-config.js ou utiliser le mode simulation
```

#### **Documents non traités**
```
Solution : Vérifier que PDF.js est chargé et que les fichiers sont valides
```

### **Logs de Débogage**
```javascript
// Activer les logs détaillés
localStorage.setItem('debug_mode', 'true');
console.log('Mode debug activé');
```

## 📞 Support

### **Ressources**
- 📖 **Documentation complète** : `README_UPDATED.md`
- 🤖 **Fonctionnalités IA** : `AI_FEATURES.md`
- 🔧 **Guide de déploiement** : `DEPLOYMENT.md`

### **Contact**
- **Issues** : Créer une issue sur GitHub
- **Documentation** : Consulter les guides détaillés
- **Communauté** : Forum d'entraide

## ✅ Checklist d'Installation

- [ ] Fichiers décompressés
- [ ] Serveur web configuré
- [ ] Firebase configuré (optionnel)
- [ ] OpenAI configuré (optionnel)
- [ ] Application accessible
- [ ] Import de documents testé
- [ ] Authentification testée (si configurée)
- [ ] IA testée (si configurée)

---

**StudyHub** est maintenant prêt à transformer vos documents en outils de révision intelligents ! 🎓✨