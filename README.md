# OCR Correction App

Application de correction automatique utilisant l'OCR et l'IA pour analyser et corriger des documents.

## 🚀 Déploiement sur Render

1. **Créer un compte Render**
   - Rendez-vous sur [render.com](https://render.com)
   - Créez un compte ou connectez-vous
   - Liez votre compte GitHub

2. **Configuration des variables d'environnement**
   
   Configurez les variables suivantes dans Render :

   ```env
   # Frontend
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

   # Backend
   PORT=8000
   NODE_ENV=production
   MISTRAL_API_KEY=votre_cle_api_mistral
   SUPABASE_URL=votre_url_supabase
   SUPABASE_SERVICE_KEY=votre_cle_service_supabase
   GOOGLE_VISION_CREDENTIALS=votre_json_credentials_base64
   ```

3. **Déploiement**
   - Dans Render, cliquez sur "New +"
   - Sélectionnez "Blueprint"
   - Choisissez ce dépôt
   - Render va automatiquement détecter le fichier `render.yaml`
   - Cliquez sur "Apply" pour déployer

4. **Vérification**
   - Frontend : `https://ocr-correction-frontend.onrender.com`
   - Backend : `https://ocr-correction-backend.onrender.com`
   - Vérifiez les logs pour tout problème éventuel

## 💻 Développement local

1. **Installation**
   ```bash
   # Cloner le dépôt
   git clone https://github.com/ledesseinduneideecontact/OCR-correction.git
   cd OCR-correction

   # Installer les dépendances
   npm install
   ```

2. **Configuration**
   - Copiez `.env.example` en `.env`
   - Remplissez les variables d'environnement

3. **Lancement**
   ```bash
   # Terminal 1 : Frontend
   npm run dev

   # Terminal 2 : Backend
   npm run server
   ```

4. **Accès**
   - Frontend : `http://localhost:3000`
   - Backend : `http://localhost:8000`

## 🔄 Mise à jour en temps réel

Le projet est configuré pour le développement en temps réel :

- **Frontend** : Vite HMR (Hot Module Replacement)
  - Les modifications sont visibles instantanément
  - Pas besoin de recharger la page

- **Backend** : Nodemon
  - Redémarrage automatique lors des modifications
  - Les logs sont visibles dans la console

## 📝 Notes importantes

- Le frontend utilise Vite pour un développement rapide
- Le backend utilise TypeScript pour plus de robustesse
- Les modifications sont déployées automatiquement sur Render
- Les variables d'environnement sensibles doivent être configurées dans Render
- Les secrets ne doivent jamais être commités dans Git 